export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const flowUrl = process.env.POWER_AUTOMATE_FLOW_URL;

  // Power Automate wurde verworfen / ist deaktiviert:
  // -> sauber signalisieren, statt den Order-Flow kaputt zu machen.
  if (!flowUrl) {
    return res.status(501).json({
      ok: false,
      disabled: true,
      message: "Power Automate upload is disabled (POWER_AUTOMATE_FLOW_URL not set).",
    });
  }

  try {
    const {
      orderId,
      nftImage,
      backplate,
      backplateCode,
      promoCode,
      finalPriceEUR,
      wallet,
      shipping,
      createdAt,
      verifyUrl,
      txHash,
    } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: "Missing required field: orderId" });
    }

    // Debug Log
    console.log("📤 Sending order to PowerAutomate:", orderId);

    const payload = {
      orderId,
      createdAt,
      nftImage,
      backplate,
      backplateCode,
      promoCode,
      finalPriceEUR,
      wallet,
      shipping,
      verifyUrl,
      txHash,
    };

    // Timeout, damit ein Flow-Hänger nichts blockiert
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    let response;
    try {
      response = await fetch(flowUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("❌ PowerAutomate error:", response.status, errText);
      return res.status(502).json({
        error: "Flow error",
        status: response.status,
        details: errText || "No details returned from Power Automate",
      });
    }

    console.log("✔ PowerAutomate: Successfully delivered:", orderId);
    return res.status(200).json({ ok: true, delivered: orderId });
  } catch (err) {
    const msg =
      err?.name === "AbortError"
        ? "Request to Power Automate timed out"
        : err?.message || String(err);

    console.error("❌ FLOW WEBHOOK ERROR:", err);

    return res.status(500).json({
      error: "Flow Webhook failed",
      details: msg,
    });
  }
}
