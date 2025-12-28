import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { order } = req.query;

  try {
    const found = await prisma.order.findUnique({
      where: { orderId: order }
    });

    if (!found) {
      return res.status(404).json({
        ok: false,
        order: null,
        error: "Order not found"
      });
    }

    return res.status(200).json({
      ok: true,
      order: found
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      ok: false,
      order: null,
      error: "DB error"
    });
  }
}
