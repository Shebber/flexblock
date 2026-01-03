import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  // wichtig: keine Caches für Admin-Actions
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { colors } = req.body;

    if (!Array.isArray(colors)) {
      return res.status(400).json({ ok: false, error: "Invalid colors array" });
    }

    const clean = colors.map((c, i) => ({
      name: String(c.name || ""),
      code: String(c.code || `CODE_${i}`),
      hex: String(c.hex || "#000000"),
      enabled: !!c.enabled,
      sort: i,
    }));

    const result = await prisma.$transaction(async (tx) => {
      const del = await tx.backplateColor.deleteMany({});
      const ins = await tx.backplateColor.createMany({ data: clean });
      const after = await tx.backplateColor.findMany({
        orderBy: [{ sort: "asc" }, { name: "asc" }],
      });
      return { del, ins, after };
    });

    console.log("✅ updateColors saved", {
      deleted: result.del.count,
      inserted: result.ins.count,
      first: result.after.slice(0, 3),
    });

    return res.status(200).json({
      ok: true,
      deleted: result.del.count,
      inserted: result.ins.count,
      first: result.after.slice(0, 3),
      at: Date.now(),
    });
  } catch (err) {
    console.error("❌ ERROR saving colors:", err);
    return res.status(500).json({
      ok: false,
      error: "Could not save colors.",
      details: err?.message || String(err),
    });
  }
}
