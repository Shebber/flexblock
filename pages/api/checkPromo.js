export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Missing code" });

  const now = new Date();
  const expiry = new Date("2026-02-20T23:59:59Z");

  // ---------- NORMAL RABATT ----------
  if (code.toUpperCase() === "OGAPES20") {
    if (now > expiry) {
      return res.status(200).json({
        ok: false,
        message: "This promo code has expired.",
      });
    }

    return res.status(200).json({
      ok: true,
      type: "discount",
      code: "OGAPES20",
      discount: 20, // EUR
      mode: "normal",
    });
  }

  // ---------- PICKUP MODE ----------
  if (code.toUpperCase() === "SHEBBERFAM90") {
    return res.status(200).json({
      ok: true,
      type: "pickup",
      code: "SHEBBERFAM90",
      price: 25, // FIX
      mode: "pickup",
    });
  }

  return res.status(200).json({
    ok: false,
    message: "Invalid promo code",
  });
}
