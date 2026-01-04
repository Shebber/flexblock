// pages/api/order/init.js
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { applyPromo } from "../../../lib/promo";
import { signProduction } from "../../../lib/productionSig"; // ✅ NEW


const prisma = new PrismaClient();

function makePublicId() {
  const hex = crypto.randomBytes(9).toString("hex");
  return `fb_${hex}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const {
      orderId,
      wallet,
      nft,
      nftChainId,
      backplate,
      backplateCode,
      promoCode, // ✅ nur den Code nehmen
      shipping,
    } = req.body || {};

const chainIdNum =
  nftChainId != null
    ? Number(nftChainId)
    : nft?.chainId != null
    ? Number(nft.chainId)
    : null;

console.log("🧬 INIT chainId resolved:", { nftChainId, nftChainIdFromNft: nft?.chainId, chainIdNum });


if (chainIdNum != null && !Number.isFinite(chainIdNum)) {
  return res.status(400).json({ ok: false, error: "Invalid nftChainId" });
}

    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nftflexblock.xyz";

    const basePrice = Number(process.env.BASE_PRICE_EUR || 0);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return res.status(500).json({ error: "BASE_PRICE_EUR missing/invalid" });
    }

    // ✅ Preis-Wahrheit kommt vom Server
    const pricing = applyPromo(promoCode, basePrice);

    const oid = String(orderId);

    // Falls Order existiert, publicId behalten; sonst neu
    const existing = await prisma.order.findUnique({ where: { orderId: oid } });
    const publicId = existing?.publicId || makePublicId();
    const verifyUrl = `${siteUrl}/verify/${publicId}`;

    const saved = await prisma.order.upsert({
      where: { orderId: oid },
      update: {
        // NFC
        publicId,
        verifyUrl,

        // WALLET/NFT/BACKPLATE/SHIPPING dürfen aktualisiert werden
        wallet: wallet || null,

        nftContract: nft?.contract || "",
        nftTokenId: Number(nft?.tokenId || 0),
        nftImage: nft?.image || null,
        ...(chainIdNum != null ? { nftChainId: chainIdNum } : {}),



        backplate: backplate || null,
        backplateCode: backplateCode || null,

        shipName: shipping?.name || "",
        shipStreet: shipping?.street || null,
        shipZip: shipping?.zip || null,
        shipCity: shipping?.city || null,
        shipCountry: shipping?.country || null,

        // ✅ PROMO & PREIS nur serverseitig
        promo: pricing.promo,
        promoCode: pricing.promoCode,
        promoDiscount: pricing.promoDiscount,
        promoPickup: pricing.promoPickup,
        finalPriceEUR: pricing.finalPriceEUR,
      },
      create: {
        orderId: oid,
        status: "pending",

        publicId,
        verifyUrl,

        wallet: wallet || null,

        nftContract: nft?.contract || "",
        nftTokenId: Number(nft?.tokenId || 0),
        nftImage: nft?.image || null,
        nftChainId: chainIdNum,



        backplate: backplate || null,
        backplateCode: backplateCode || null,

        promo: pricing.promo,
        promoCode: pricing.promoCode,
        promoDiscount: pricing.promoDiscount,
        promoPickup: pricing.promoPickup,
        finalPriceEUR: pricing.finalPriceEUR,

        shipName: shipping?.name || "",
        shipStreet: shipping?.street || null,
        shipZip: shipping?.zip || null,
        shipCity: shipping?.city || null,
        shipCountry: shipping?.country || null,
      },
    });

    // --------------------------------------------------
    // ✅ NEW: Production Signature (HMAC)
    // --------------------------------------------------
    const sigTs = Date.now();
    const productionSig = signProduction({
      orderId: saved.orderId,
      publicId: saved.publicId || publicId,
      sigTs,
    });

    return res.status(200).json({
      ok: true,
      orderId: saved.orderId,
      publicId: saved.publicId,
      verifyUrl: saved.verifyUrl,

      // ✅ NEW fields (client sends them to /api/production)
      productionSig,
      productionSigTs: sigTs,

      pricing: {
        promo: saved.promo,
        promoCode: saved.promoCode,
        promoDiscount: saved.promoDiscount,
        promoPickup: saved.promoPickup,
        finalPriceEUR: saved.finalPriceEUR,
      },
    });
  } catch (err) {
    console.error("❌ INIT ERROR:", err);
    return res.status(500).json({ error: "Init failed", details: err.message });
  }
}
