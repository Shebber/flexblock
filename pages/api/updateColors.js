import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { colors } = req.body;

    if (!Array.isArray(colors)) {
      return res.status(400).json({ error: "Invalid colors array" });
    }

    const filePath = path.join(process.cwd(), "data", "backplateColors.json");

    // SHOP-KOMPATIBLES FORMAT SICHERN:
    const fileContent = JSON.stringify({ colors }, null, 2);

    // optional: Backup anlegen (empfohlen)
    fs.writeFileSync(
      filePath + ".backup",
      fs.readFileSync(filePath, "utf8"),
      "utf8"
    );

    fs.writeFileSync(filePath, fileContent, "utf8");

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ERROR saving colors:", err);
    res.status(500).json({ error: "Could not save colors." });
  }
}
