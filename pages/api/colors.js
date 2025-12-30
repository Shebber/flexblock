import fs from "fs";
import path from "path";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    // 1) Erst DB versuchen
    const dbColors = await prisma.backplateColor.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
    });

    if (dbColors.length > 0) {
      return res.status(200).json({
        colors: dbColors.map((c) => ({
          name: c.name,
          code: c.code,
          hex: c.hex,
          enabled: c.enabled,
        })),
      });
    }

    // 2) Fallback: Datei lesen (damit Checkout sofort funktioniert)
    const filePath = path.join(process.cwd(), "data", "backplateColors.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed.colors) ? parsed.colors : [];

    // 3) Optional: Auto-Seed in DB (einmalig)
    const clean = list.map((c, i) => ({
      name: String(c.name || ""),
      code: String(c.code || `CODE_${i}`),
      hex: String(c.hex || "#000000"),
      enabled: !!c.enabled,
      sort: i,
    }));

    if (clean.length > 0) {
      // createMany + skipDuplicates (wegen @unique code)
      await prisma.backplateColor.createMany({
        data: clean,
        skipDuplicates: true,
      });
    }

    return res.status(200).json({ colors: list });
  } catch (err) {
    console.error("ERROR loading colors:", err);
    return res.status(500).json({ error: "Could not load colors." });
  }
}
