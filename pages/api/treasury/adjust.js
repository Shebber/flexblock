import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);

  if (!session)
    return res.status(401).json({ error: "Unauthorized" });

  // Input erwartet jetzt "newEth" statt "newApe"
  const { newEth, reason } = req.body;

  if (!newEth || !reason)
    return res.status(400).json({ error: "Missing fields (newEth, reason)" });

  // 1. Aktuellen rechnerischen Bestand ermitteln
  const orders = await prisma.order.findMany();
  const totalEthCollected = orders.reduce(
    (sum, o) => sum + Number(o.ethAmount || 0),
    0
  );

  const adjustments = await prisma.treasuryAdjustment.findMany();
  const deltaSum = adjustments.reduce(
    (sum, a) => sum + Number(a.deltaEth || 0),
    0
  );

  const previousEth = totalEthCollected + deltaSum;
  
  // 2. Delta berechnen
  const delta = Number(newEth) - previousEth;

  // 3. Eintrag erstellen (mit ETH Feldnamen)
  const entry = await prisma.treasuryAdjustment.create({
    data: {
      previousEth,        // Umbenannt von previousApe
      newEth,             // Umbenannt von newApe
      deltaEth: delta,    // Umbenannt von deltaApe
      reason,
      changedBy: session.user.email,
    },
  });

  return res.status(200).json({ ok: true, entry });
}