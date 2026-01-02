import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const b = req.body || {};

    // akzeptiere beide Namen (orderId / order) + GET oder POST
    const orderId = q.orderId || q.order || b.orderId || b.order || null;
    const publicId = q.publicId || b.publicId || null;

    // Debug: sofort sehen, was ankommt
    console.log("🧾 getOrder params", { method: req.method, orderId, publicId });

    if (!orderId && !publicId) {
      return res.status(400).json({
        ok: false,
        order: null,
        error: "Missing orderId/publicId",
      });
    }

    const where = publicId
      ? { publicId: String(publicId) }
      : { orderId: String(orderId) };

    const order = await prisma.order.findUnique({ where });

    if (!order) {
      return res.status(404).json({
        ok: false,
        order: null,
        error: "Order not found",
      });
    }

    return res.status(200).json({ ok: true, order });
  } catch (err) {
    // Debug: gib DETAILS zurück (nur solange wir fixen!)
    console.error("❌ getOrder failed:", err);

    return res.status(500).json({
      ok: false,
      order: null,
      error: "DB error",
      details: err?.message || String(err),
      name: err?.name || null,
    });
  }
}
