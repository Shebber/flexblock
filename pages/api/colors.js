import fs from "fs";
import path from "path";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  // wichtig: Browser/Edge darf das nicht “festhalten”
  res.setHeader("Cache-Control", "no-store");

  try {
    // 1) Erst DB versuchen
    const dbColors = await prisma.backplateColor.findMany({
      orderBy: [{ sort: "asc" }, { name: "asc" }],
    });

    if (dbColors.length > 0) {
      console.log("🎨 colors source=DB", { count: dbColors.length });
      return res.status(200).json({
        ok: true,
        source: "db",
        count: dbColors.length,
        at: Date.now(),
        colors: dbColors.map((c) => ({
          name: c.name,
          code: c.code,
          hex: c.hex,
          enabled: c.enabled,
        })),
      });
    }

    // 2) Fallback: Datei lesen
    const filePath = path.join(process.cwd(), "data", "backplateColors.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed.colors) ? parsed.colors : [];

    console.log("🎨 colors source=FILE", { count: list.length, filePath });

    return res.status(200).json({
      ok: true,
      source: "file",
      count: list.length,
      at: Date.now(),
      colors: list,
    });
  } catch (err) {
    console.error("❌ ERROR loading colors:", err);
    return res.status(500).json({
      ok: false,
      error: "Could not load colors.",
      details: err?.message || String(err),
    });
  }
}
