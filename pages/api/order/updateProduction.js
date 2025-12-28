// /pages/api/order/updateProduction.js
import { PrismaClient } from "@prisma/client";
import { setTaskStatus, FLEX_STATUS } from "../../../lib/wrike";  // ⭐ WRIKE INTEGRATION
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "POST only" });

  try {
    const { orderId, status, trackingUrl } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // 1) Order laden
    const order = await prisma.order.findUnique({ where: { orderId } });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2) Status in DB setzen
    const newStatus = status || "finished";

    const updated = await prisma.order.update({
      where: { orderId },
      data: {
        status: newStatus,
        trackingUrl: trackingUrl || null,
      }
    });

    console.log(`✅ Order ${orderId} updated → ${newStatus}`);

    // 3) WRIKE STATUS UPDATE (wenn Task vorhanden)
    if (order.wrikeTaskId) {
      try {
        let wrikeTarget;

        if (newStatus === "production") {
          wrikeTarget = FLEX_STATUS.PRODUCTION;
        } else if (newStatus === "shipped") {
          wrikeTarget = FLEX_STATUS.SHIPPED;
        } else {
          wrikeTarget = FLEX_STATUS.ORDER; // fallback
        }

        console.log(
          `↗️ Updating Wrike Task ${order.wrikeTaskId} → Status ${wrikeTarget}`
        );

        await setTaskStatus(order.wrikeTaskId, wrikeTarget);

        console.log("✅ Wrike task updated successfully");
      } catch (err) {
        console.error("⚠️ Wrike update failed:", err);
      }
    } else {
      console.log("ℹ️ No wrikeTaskId stored on this order → skipping Wrike update");
    }

    return res.status(200).json({ ok: true, updated });

  } catch (err) {
    console.error("❌ ERROR /api/order/updateProduction:", err);
    return res.status(500).json({
      ok: false,
      error: "Production update failed"
    });
  }
}
