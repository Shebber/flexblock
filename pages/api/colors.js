import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "data", "backplateColors.json");
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    // parsed = { colors: [ ... ] }
    const list = Array.isArray(parsed.colors) ? parsed.colors : [];

    res.status(200).json({ colors: list });
  } catch (err) {
    console.error("ERROR loading colors:", err);
    res.status(500).json({ error: "Could not load colors." });
  }
}
