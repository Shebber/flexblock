import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"], // bei Bedarf: ["query","info","warn","error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function handler(req, res) {
  try {
    const q = req.query || {};
    const b = req.body || {};

    const orderId = first(q.orderId) || first(q.order) || b.orderId || b.order || null;
    const publicId = first(q.publicId) || b.publicId || null;

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
    console.error("❌ getOrder failed:", err);

    return res.status(500).json({
      ok: false,
      order: null,
      error: "DB error",
      // ⚠ Debug nur solange fixen – später wieder raus:
      details: err?.message || String(err),
      name: err?.name || null,
    });
  }
}
