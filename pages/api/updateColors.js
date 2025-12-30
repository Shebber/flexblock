import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { colors } = req.body;

    if (!Array.isArray(colors)) {
      return res.status(400).json({ error: "Invalid colors array" });
    }

    const clean = colors.map((c, i) => ({
      name: String(c.name || ""),
      code: String(c.code || `CODE_${i}`),
      hex: String(c.hex || "#000000"),
      enabled: !!c.enabled,
      sort: i,
    }));

    // Replace-all (einfach & robust)
    await prisma.$transaction([
      prisma.backplateColor.deleteMany({}),
      prisma.backplateColor.createMany({ data: clean }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ERROR saving colors:", err);
    return res.status(500).json({ error: "Could not save colors." });
  }
}
