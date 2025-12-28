import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { setTaskStatus, FLEX_STATUS } from "../../../lib/wrike";   // ⭐ WRIKE
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  const session = await getServerSession(req, res, authOptions);
  if (!session)
    return res.status(401).json({ error: "Unauthorized" });

  const { orderId, trackingUrl } = req.body;

  if (!orderId || !trackingUrl) {
    return res.status(400).json({ error: "Missing orderId or trackingUrl" });
  }

  try {
    // 1) Lade Order
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2) Update DB: Tracking + Status → shipped
    const updated = await prisma.order.update({
      where: { orderId },
      data: {
        trackingUrl,
        status: "shipped",
      }
    });

    console.log(`📦 Tracking updated for ${orderId}: ${trackingUrl}`);
    console.log(`🚚 Status set to shipped`);

    // 3) WRIKE Status pushen
    if (order.wrikeTaskId) {
      try {
        console.log(
          `↗️ Updating Wrike Task ${order.wrikeTaskId} → Status ${FLEX_STATUS.SHIPPED}`
        );

        await setTaskStatus(order.wrikeTaskId, FLEX_STATUS.SHIPPED);

        console.log("✅ Wrike task updated to SHIPPED");
      } catch (err) {
        console.error("⚠️ Wrike update failed:", err);
      }
    } else {
      console.log("ℹ️ Order has no wrikeTaskId → skipping Wrike update");
    }

    return res.status(200).json({ ok: true, updated });

  } catch (err) {
    console.error("❌ ERROR /api/order/setTracking:", err);
    return res.status(500).json({ error: "Tracking update failed" });
  }
}
