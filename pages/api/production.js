import { verifyProduction } from "../../lib/productionSig";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Libs
import { createWrikeTask } from "../../lib/wrike";
import { uploadToOneDrive } from "../../lib/onedrive";
import { mintFlexPass } from "../../lib/flexpass";
import { normalizeFlexblockImage } from "../../lib/image";

const prisma = new PrismaClient();

function wrikeSafe(input = "") {
  return String(input)
    .replace(/\u2026/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

// helper: normalize addresses
const norm = (a) => {
  try {
    return ethers.getAddress(String(a));
  } catch {
    return null;
  }
};

// ✅ log + respond helper (macht Vercel-Logs endlich brauchbar)
const fail = (res, status, payload, ctx = {}) => {
  const msg = payload?.error || "Request failed";
  // console.warn wird i.d.R. sauber in Vercel gelistet
  console.warn(`❌ /api/production ${status}: ${msg}`, { payload, ...ctx });
  return res.status(status).json(payload);
};

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, 405, { error: "POST only" });

  try {
    console.log("📥 HIT /api/production");

    const {
      orderId,
      txHash,
      amountEth,
      ethPrice,
      wallet,        // optional fallback
      backplate,     // optional fallback
      backplateCode, // optional fallback
      nft,           // optional fallback
      shipping,      // optional fallback
      productionSig,
      productionSigTs,
    } = req.body || {};

    if (!orderId) return fail(res, 400, { error: "Missing orderId" });
    if (!txHash) return fail(res, 400, { error: "Missing txHash" }, { orderId });

    // ✅ Validate txHash format before calling RPC
    if (!ethers.isHexString(String(txHash), 32)) {
      return fail(res, 400, { error: "Invalid txHash format" }, { orderId, txHash });
    }

    // --------------------------------------------------
    // 1) ORDER LADEN (DB = Wahrheit)
    // --------------------------------------------------
    const order = await prisma.order.findUnique({
      where: { orderId: String(orderId) },
    });

    if (!order) {
      return fail(res, 404, { error: "Order not found" }, { orderId });
    }

    // --------------------------------------------------
    // ✅ SIGNATURE GUARD (HMAC aus /api/order/init)
    // --------------------------------------------------
    if (!productionSig || !productionSigTs) {
      return fail(
        res,
        401,
        { error: "Missing production signature" },
        { orderId, hasSig: !!productionSig, hasTs: !!productionSigTs }
      );
    }

    const ts = Number(productionSigTs);
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

    if (!Number.isFinite(ts)) {
      return fail(res, 401, { error: "Invalid productionSigTs" }, { orderId, productionSigTs });
    }
    if (Date.now() - ts > MAX_AGE_MS) {
      return fail(res, 401, { error: "Production signature expired" }, { orderId, ts });
    }

    const publicId = order.publicId || order.orderId;

    const okSig = verifyProduction({
      orderId: String(order.orderId),
      publicId: String(publicId),
      sigTs: String(ts),
      sig: String(productionSig),
    });

    if (!okSig) {
      return fail(
        res,
        401,
        { error: "Invalid production signature" },
        { orderId, publicId, ts }
      );
    }

    // ✅ idempotent, aber: nicht abbrechen, wenn FlexPass noch fehlt!
    const alreadyProcessed = Boolean(order.txHash) && order.txHash === String(txHash);
    const alreadyMinted = order.flexPassTokenId != null;

    if (alreadyProcessed && alreadyMinted) {
      return res.status(200).json({
        ok: true,
        orderId,
        verifyUrl: order.verifyUrl,
        flexPassTokenId: order.flexPassTokenId,
        message: "Already processed",
      });
    }

    // ✅ Wallet für Mint & Buyer: bevorzugt DB, fallback Request
    const mintTo = order.wallet || wallet;
    if (!mintTo) {
      console.warn("⚠ Mint wallet missing (order.wallet + req.wallet empty). Mint will be skipped.");
    }

    // --------------------------------------------------
    // 1b) TX CHECK (Base payment validation)
    // --------------------------------------------------
    const BASE_RPC = process.env.BASE_RPC_URL || process.env.PAYMENT_RPC_URL || process.env.RPC_URL;
    const RECIPIENT_RAW =
      process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || process.env.RECIPIENT_ADDRESS;

    if (!BASE_RPC) {
      return fail(res, 500, { error: "Missing BASE_RPC_URL (or PAYMENT_RPC_URL)" }, { orderId });
    }
    if (!RECIPIENT_RAW) {
      return fail(res, 500, { error: "Missing NEXT_PUBLIC_RECIPIENT_ADDRESS (or RECIPIENT_ADDRESS)" }, { orderId });
    }

    const recipient = norm(RECIPIENT_RAW);
    if (!recipient) {
      return fail(res, 500, { error: "Recipient address invalid" }, { orderId, RECIPIENT_RAW });
    }

    // Buyer = DB-Wallet (Truth), fallback request wallet
    const buyer = norm(order.wallet || wallet);
    if (!buyer) {
      return fail(res, 400, { error: "Missing buyer wallet (order.wallet empty)" }, { orderId });
    }

    // amountEth muss vom Checkout kommen
    let expectedWei = null;
    try {
      expectedWei = ethers.parseEther(String(amountEth));
    } catch {
      return fail(res, 400, { error: "Invalid amountEth" }, { orderId, amountEth });
    }

    const provider = new ethers.JsonRpcProvider(BASE_RPC);

    // Chain check
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== 8453) {
      return fail(
        res,
        400,
        { error: "Wrong chain for payment", expectedChainId: 8453, gotChainId: Number(net.chainId) },
        { orderId }
      );
    }

    // Load tx + receipt
    const tx = await provider.getTransaction(String(txHash));
    if (!tx) {
      return fail(res, 400, { error: "Transaction not found on Base", txHash }, { orderId });
    }

    const receipt = await provider.getTransactionReceipt(String(txHash));
    if (!receipt) {
      return fail(res, 400, { error: "Transaction receipt not found yet", txHash }, { orderId });
    }
    if (receipt.status !== 1) {
      return fail(res, 400, { error: "Transaction failed", txHash }, { orderId });
    }

    // Validate to/from/value
    const txTo = norm(tx.to);
    const txFrom = norm(tx.from);

    if (!txTo || txTo !== recipient) {
      return fail(
        res,
        400,
        { error: "Payment recipient mismatch", expectedTo: recipient, gotTo: tx.to || null },
        { orderId, txHash }
      );
    }

    if (!txFrom || txFrom !== buyer) {
      return fail(
        res,
        400,
        { error: "Payment sender mismatch", expectedFrom: buyer, gotFrom: tx.from || null },
        { orderId, txHash }
      );
    }

    const paidWei = tx.value; // bigint (ethers v6)
    if (paidWei < expectedWei) {
      return fail(
        res,
        400,
        { error: "Underpaid", expectedWei: expectedWei.toString(), paidWei: paidWei.toString() },
        { orderId, txHash }
      );
    }

    // Prevent tx reuse across orders
    const alreadyUsed = await prisma.order.findFirst({
      where: {
        txHash: String(txHash),
        NOT: { orderId: String(orderId) },
      },
    });

    if (alreadyUsed) {
      return fail(res, 400, { error: "txHash already used by another order", txHash }, { orderId });
    }

    console.log("✅ TX CHECK OK:", {
      orderId,
      txHash,
      buyer,
      recipient,
      paidWei: paidWei.toString(),
    });

    // ✅ Backplate/Shipping/NFT primär aus DB
    const effectiveBackplate = order.backplate || backplate || null;
    const effectiveBackplateCode = order.backplateCode || backplateCode || null;

    const effectiveShipping = {
      name: order.shipName || shipping?.name || "",
      street: order.shipStreet ?? shipping?.street ?? null,
      zip: order.shipZip ?? shipping?.zip ?? null,
      city: order.shipCity ?? shipping?.city ?? null,
      country: order.shipCountry ?? shipping?.country ?? null,
    };

    const effectiveNft = {
      contract: order.nftContract || nft?.contract || "",
      tokenId: order.nftTokenId ?? Number(nft?.tokenId || 0),
      image: order.nftImage || nft?.image || null,
    };

    // Promo/Preis NUR aus DB
    const promoPickup = !!order.promoPickup;
    const promoCodeDb = order.promoCode || null;
    const promoDiscountDb = order.promoDiscount ?? 0;
    const finalPriceDb = order.finalPriceEUR;

    // --------------------------------------------------
    // 2) NFT IMAGE DOWNLOAD (nur DB/effektive URL)
    // --------------------------------------------------
    const imageUrl = effectiveNft.image;
    let localImagePath = null;     // DB Pfad (Vorschau)
    let absoluteImagePath = null;  // Dateisystem Pfad (Original)
    let fileName = null;           // Original Name

    const isVercel = process.env.VERCEL === "1";
    const baseDir = isVercel ? "/tmp" : path.join(process.cwd(), "public", "production");

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    if (imageUrl) {
      try {
        console.log("⬇ Downloading Image:", imageUrl);
        const safeName = String(orderId).replace(/[^a-zA-Z0-9]/g, "");
        fileName = `${safeName}.jpg`;
        const filePath = path.join(baseDir, fileName);

        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Fetch failed: ${imgRes.status} ${imgRes.statusText}`);

        const buffer = Buffer.from(await imgRes.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        absoluteImagePath = filePath;
        localImagePath = isVercel ? null : `/production/${fileName}`;
        console.log("✅ Image saved locally:", filePath);
      } catch (err) {
        console.error("❌ IMAGE DOWNLOAD FAILED:", err?.message || err);
      }
    } else {
      console.warn("⚠ No NFT image URL found (order.nftImage empty). Skipping image pipeline.");
    }

    // --------------------------------------------------
    // 2b) IMAGE NORMALIZATION (320x320mm Canvas / 100dpi)
    // --------------------------------------------------
    let finalPath = absoluteImagePath;
    let finalFileName = fileName;

    if (absoluteImagePath && fileName) {
      try {
        console.log("🧩 Normalizing image for Flexblock production…");

        const normalizedName = fileName.replace(".jpg", "_print_320mm.jpg");
        const normalizedPath = path.join(baseDir, normalizedName);

        await normalizeFlexblockImage(absoluteImagePath, normalizedPath);

        finalPath = normalizedPath;
        finalFileName = normalizedName;

        localImagePath = isVercel ? null : `/production/${normalizedName}`;

        console.log("✔ Image normalized:", normalizedPath);
      } catch (err) {
        console.error("❌ IMAGE NORMALIZATION FAILED:", err);
      }
    }

    // --------------------------------------------------
    // 3) ONEDRIVE UPLOAD (finalPath)
    // --------------------------------------------------
    let cloudImagePath = null;

    if (finalPath && finalFileName) {
      try {
        console.log(`☁ Uploading to OneDrive: ${finalFileName}`);

        const uploadResult = await uploadToOneDrive(finalPath, finalFileName);

        if (uploadResult.ok && uploadResult.webUrl) {
          cloudImagePath = uploadResult.webUrl;
          console.log("✔ OneDrive uploaded:", cloudImagePath);
        } else {
          console.warn("⚠ OneDrive upload failed:", uploadResult);
        }
      } catch (err) {
        console.error("❌ OneDrive upload error:", err);
      }
    }

    // --------------------------------------------------
    // 4) VERIFY URL & WRIKE
    // --------------------------------------------------
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nftflexblock.xyz";
    const verifyId = order.publicId || orderId;
    const verifyUrl = `${siteUrl}/verify/${verifyId}`;

    let wrikeTaskId = null;

    if (String(process.env.WRIKE_ENABLED).toLowerCase() === "true") {
      try {
        console.log("📝 Creating Wrike Task…");

        const description = wrikeSafe(`
Flexblock Order ${orderId}

Print File (OneDrive):
${cloudImagePath || "Upload Failed"}

Preview (Local):
${localImagePath || "No local preview"}

NFT:
Contract: ${effectiveNft.contract || "-"}
Token: ${effectiveNft.tokenId || "-"}

Backplate:
${effectiveBackplateCode || effectiveBackplate || "-"}

Shipping:
${effectiveShipping.name || ""}
${effectiveShipping.street || ""}
${effectiveShipping.zip || ""} ${effectiveShipping.city || ""}
${effectiveShipping.country || ""}
Pickup: ${promoPickup ? "YES" : "NO"}

Promo:
${promoCodeDb || "-"} (discount: ${promoDiscountDb})

Verify:
${verifyUrl}
`);

        wrikeTaskId = await createWrikeTask({
          folderId: process.env.WRIKE_FOLDER_ID,
          title: wrikeSafe(`Flexblock Order ${orderId}`),
          description,
          customStatusId: "IEAATM5VJMGPIOUI",
        });

        console.log("✔ Wrike Task created:", wrikeTaskId);
      } catch (err) {
        console.error("❌ WRIKE FAILED:", err);
      }
    }

    // --------------------------------------------------
    // 5) ORDER UPDATE (PAID) – Preis/Promo NICHT überschreiben!
    // --------------------------------------------------
    await prisma.order.update({
      where: { orderId: String(orderId) },
      data: {
        status: "paid",
        txHash: txHash || null,
        ethAmount: amountEth?.toString?.() || String(amountEth || "") || null,
        ethPrice: ethPrice?.toString?.() || String(ethPrice || "") || null,

        // Wallet/Backplate/Shipping nur als “Fallback” speichern, wenn DB leer ist
        wallet: order.wallet || mintTo || null,
        backplate: order.backplate || effectiveBackplate,
        backplateCode: order.backplateCode || effectiveBackplateCode,

        shipName: order.shipName || effectiveShipping.name || "",
        shipStreet: order.shipStreet ?? effectiveShipping.street ?? null,
        shipZip: order.shipZip ?? effectiveShipping.zip ?? null,
        shipCity: order.shipCity ?? effectiveShipping.city ?? null,
        shipCountry: order.shipCountry ?? effectiveShipping.country ?? null,

        // Image/Verify/Wrike
        localImagePath,
        convertedCloudPath: cloudImagePath || null,
        verifyUrl: order.verifyUrl || verifyUrl,
        publicId: order.publicId || verifyId,
        wrikeTaskId,
      },
    });

    // --------------------------------------------------
    // 6) FLEXPASS MINT (nur wenn noch nicht vorhanden)
    // --------------------------------------------------
    const orderAfterUpdate = await prisma.order.findUnique({
      where: { orderId: String(orderId) },
      select: { flexPassTokenId: true, wallet: true, txHash: true },
    });

    console.log("🧪 mint precheck", {
      orderId,
      mintTo,
      mintToNorm: norm(mintTo),
      chainRpc: process.env.APECHAIN_RPC_URL
        ? "APECHAIN_RPC_URL"
        : (process.env.RPC_URL ? "RPC_URL" : "NONE"),
      hasPriv: !!process.env.OWNER_PRIVATE_KEY,
      hasContract: !!process.env.FLEXPASS_CONTRACT,
      alreadyProcessed,
      alreadyMinted: orderAfterUpdate?.flexPassTokenId != null,
    });

    console.log("🧪 order mint state", {
      flexPassTokenId: orderAfterUpdate?.flexPassTokenId ?? null,
      walletInDb: orderAfterUpdate?.wallet ?? null,
      txHashInDb: orderAfterUpdate?.txHash ?? null,
    });

    const mintToNorm = norm(mintTo);

    if (!mintTo) {
      console.warn("⚠ Mint skipped: no wallet in order or request");
    } else if (!mintToNorm) {
      console.warn("⚠ Mint skipped: invalid wallet format", { mintTo });
    } else if (orderAfterUpdate?.flexPassTokenId != null) {
      console.log("ℹ FlexPass already minted:", orderAfterUpdate.flexPassTokenId);
    } else {
      try {
        console.log("🪙 Minting Flexblock Production Pass…");

        const mintResult = await mintFlexPass({ to: mintToNorm, orderId: String(orderId) });

        if (mintResult.ok) {
          const fpId = mintResult.tokenId;

          if (fpId == null || !Number.isFinite(fpId)) {
            throw new Error(`Mint returned invalid tokenId: ${mintResult.tokenId}`);
          }

          await prisma.order.update({
            where: { orderId: String(orderId) },
            data: { flexPassTokenId: fpId },
          });

          console.log("✔ FlexPass minted:", fpId);
        } else {
          console.warn("⚠ FlexPass mint failed:", mintResult.error);
        }
      } catch (err) {
        console.error("❌ FLEXPASS MINT ERROR:", err);
      }
    }

    console.log("✔ PRODUCTION COMPLETE:", orderId);

    const finalOrder = await prisma.order.findUnique({
      where: { orderId: String(orderId) },
      select: { verifyUrl: true, flexPassTokenId: true },
    });

    return res.status(200).json({
      ok: true,
      orderId,
      verifyUrl: finalOrder?.verifyUrl || verifyUrl,
      flexPassTokenId: finalOrder?.flexPassTokenId ?? null,
      finalPriceEUR: finalPriceDb,
      promoCode: promoCodeDb,
      promoDiscount: promoDiscountDb,
      promoPickup,
    });
  } catch (err) {
    console.error("❌ PRODUCTION ERROR:", err);
    return fail(res, 500, { error: "Production failed", details: err?.message || String(err) });
  }
}
