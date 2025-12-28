export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
      txHash
    } = req.body;

    // Debug Log
    console.log("📤 Sending order to PowerAutomate:", orderId);

    // Power Automate URL aus ENV
    const flowUrl = process.env.POWER_AUTOMATE_FLOW_URL;
    if (!flowUrl) {
      return res.status(500).json({ error: "Flow URL missing" });
    }

    const response = await fetch(flowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
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
        txHash
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ PowerAutomate error:", errText);
      return res.status(500).json({
        error: "Flow error",
        details: errText,
      });
    }

    console.log("✔ PowerAutomate: Successfully delivered:", orderId);

    return res.status(200).json({ ok: true, delivered: orderId });

  } catch (err) {
    console.error("❌ FLOW WEBHOOK ERROR:", err);
    return res.status(500).json({
      error: "Flow Webhook failed",
      details: err.message,
    });
  }
}
