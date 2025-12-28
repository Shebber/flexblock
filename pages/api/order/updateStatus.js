import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "POST only" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { orderId, status } = req.body;

  try {
    await prisma.order.update({
      where: { orderId },
      data: { status }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "DB error" });
  }
}
