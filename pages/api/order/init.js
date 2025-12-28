// pages/api/order/init.js
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function makePublicId() {
  // kurze, URL-sichere ID (ASCII only)
  // Beispiel: "fb_8f3a1c9e2d4b5a6c7d"
  const hex = crypto.randomBytes(9).toString("hex"); // 18 chars
  return `fb_${hex}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const {
      orderId,
      wallet,

      nft,
      backplate,
      backplateCode,

      promo,
      promoCode,
      promoDiscount,
      finalPriceEUR,
      promoPickup,

      shipping,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    // SITE URL (Fallback optional, aber besser env sauber setzen)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nftflexblock.xyz";

    // -------------------------------
    // ⭐ Preis sauber & sicher parsen
    // -------------------------------
    let normalizedFinalPrice = null;

    if (finalPriceEUR !== undefined && finalPriceEUR !== null) {
      const cleaned =
        typeof finalPriceEUR === "string" ? finalPriceEUR.trim() : finalPriceEUR;

      const num = Number(cleaned);
      if (!Number.isNaN(num)) normalizedFinalPrice = num > 0 ? Math.round(num) : 0;
    }

    // --------------------------------
    // Falls Order schon existiert
    // --------------------------------
    const existing = await prisma.order.findUnique({
      where: { orderId: String(orderId) },
    });

    if (existing) {
      // wenn alt/kaputt: publicId nachziehen
      let publicId = existing.publicId;
      if (!publicId) {
        publicId = makePublicId();
        const updated = await prisma.order.update({
          where: { orderId: String(orderId) },
          data: {
            publicId,
            verifyUrl: `${siteUrl}/verify/${publicId}`,
          },
        });
        publicId = updated.publicId;
      }

      return res.status(200).json({
        ok: true,
        orderId,
        publicId,
        verifyUrl: `${siteUrl}/verify/${publicId}`,
        message: "Order already initialized",
      });
    }

    // --------------------------------
    // 🟢 Order NEU anlegen (mit publicId)
    // --------------------------------
    const publicId = makePublicId();

    const created = await prisma.order.create({
      data: {
        orderId: String(orderId),

        // NFC
        publicId,
        verifyUrl: `${siteUrl}/verify/${publicId}`,

        // WALLET
        wallet: wallet || null,

        // NFT
        nftContract: nft?.contract || "",
        nftTokenId: Number(nft?.tokenId || 0),
        nftImage: nft?.image || null,

        // BACKPLATE
        backplate: backplate || null,
        backplateCode: backplateCode || null,

        // PROMO & PREIS
        promo: promo || false,
        promoCode: promoCode || null,
        promoDiscount: promoDiscount ?? 0,
        finalPriceEUR: normalizedFinalPrice,
        promoPickup: promoPickup || false,

        // SHIPPING
        shipName: shipping?.name || "",
        shipStreet: shipping?.street || null,
        shipZip: shipping?.zip || null,
        shipCity: shipping?.city || null,
        shipCountry: shipping?.country || null,

        // Status pending until paid
        status: "pending",
      },
    });

    return res.status(200).json({
      ok: true,
      orderId: created.orderId,
      publicId: created.publicId,
      verifyUrl: created.verifyUrl,
    });
  } catch (err) {
    console.error("❌ INIT ERROR:", err);
    return res.status(500).json({
      error: "Init failed",
      details: err.message,
    });
  }
}
