
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Libs
import { createWrikeTask } from "../../lib/wrike";
import { uploadToOneDrive } from "../../lib/onedrive";
import { mintFlexPass } from "../../lib/flexpass";
// 🟢 NEU: Die Image-Processing Funktion
import { normalizeFlexblockImage } from "../../lib/image";

const prisma = new PrismaClient();

function wrikeSafe(input = "") {
  return String(input)
    .replace(/\u2026/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    console.log("📥 HIT /api/production");

    const {
      orderId,
      txHash,
      amountEth,
      ethPrice,
      wallet,
      backplate,
      backplateCode,
      promo,
      promoCode,
      promoDiscount,
      finalPriceEUR,
      promoPickup,
      nft,
      shipping,
    } = req.body;

    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

  // --------------------------------------------------
// 1) ORDER LADEN
// --------------------------------------------------
const order = await prisma.order.findUnique({
  where: { orderId: String(orderId) },
});

if (!order) {
  console.error("❌ ORDER NOT FOUND:", orderId);
  return res.status(404).json({ error: "Order not found" });
}

// ✅ Wallet für Mint: bevorzugt aus Request, sonst aus DB-Order
const mintTo = wallet || order.wallet;
if (!mintTo) {
  console.warn("⚠ Mint wallet missing (req.wallet + order.wallet empty). Mint will be skipped.");
}

// ✅ finalPriceEUR absichern (kein NaN in Prisma schreiben)
const finalEur = Number(finalPriceEUR);
const finalEurSafe = Number.isFinite(finalEur)
  ? Math.round(finalEur)
  : order.finalPriceEUR;

    // --------------------------------------------------
    // 2) NFT IMAGE DOWNLOAD
    // --------------------------------------------------
    const imageUrl = nft?.image;
    let localImagePath = null;     // DB Pfad (Vorschau)
    let absoluteImagePath = null;  // Dateisystem Pfad (Original)
    let fileName = null;           // Original Name

    const isVercel = process.env.VERCEL === "1";
    const baseDir = isVercel ? "/tmp" : path.join(process.cwd(), "public", "production");

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    if (imageUrl) {
      try {
        console.log("⬇ Downloading Image:", imageUrl);
        const safeName = orderId.replace(/[^a-zA-Z0-9]/g, "");
        fileName = `${safeName}.jpg`;
        const filePath = path.join(baseDir, fileName);

        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Fetch failed: ${imgRes.statusText}`);

        const buffer = Buffer.from(await imgRes.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        absoluteImagePath = filePath;
        localImagePath = isVercel ? null : `/production/${fileName}`;
        console.log("✅ Image saved locally:", filePath);
      } catch (err) {
        console.error("❌ IMAGE DOWNLOAD FAILED:", err.message);
      }
    }

    // --------------------------------------------------
    // 2b) IMAGE NORMALIZATION (320x320mm Canvas / 100dpi)
    // --------------------------------------------------
    
    // Standard: Wir nehmen das Original, falls Normalisierung fehlschlägt
    let finalPath = absoluteImagePath;
    let finalFileName = fileName;

    if (absoluteImagePath && fileName) {
      try {
        console.log("🧩 Normalizing image for Flexblock production…");

        // Neuer Name: ORDERID_print_320mm.jpg
        const normalizedName = fileName.replace(".jpg", "_print_320mm.jpg");
        const normalizedPath = path.join(baseDir, normalizedName);

        // Aufruf deiner lib/image.js Funktion (100dpi, 320mm canvas, 305mm image, blur)
        await normalizeFlexblockImage(
          absoluteImagePath,
          normalizedPath
        );

        // 🟢 SWAP: Erfolg! Ab jetzt nutzen wir das bearbeitete Bild
        finalPath = normalizedPath;
        finalFileName = normalizedName;

        // DB Update: Wir speichern den Pfad zum bearbeiteten Bild als Vorschau
        localImagePath = isVercel ? null : `/production/${normalizedName}`;

        console.log("✔ Image normalized:", normalizedPath);

      } catch (err) {
        console.error("❌ IMAGE NORMALIZATION FAILED:", err);
        // Fallback: finalPath bleibt das Original
      }
    }

    // --------------------------------------------------
    // 3) ONEDRIVE UPLOAD (Mit finalPath & finalFileName)
    // --------------------------------------------------
    let cloudImagePath = null;

    if (finalPath && finalFileName) {
      try {
        console.log(`☁ Uploading to OneDrive: ${finalFileName}`);

        // 🟢 WICHTIG: Hier nutzen wir jetzt finalPath (das bearbeitete Bild)
        const uploadResult = await uploadToOneDrive(
          finalPath,
          finalFileName
        );

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
    const verifyId = order.publicId || orderId;
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${verifyId}`;

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
Contract: ${nft?.contract || "-"}
Token: ${nft?.tokenId || "-"}

Backplate:
${backplateCode || backplate || "-"}

Shipping:
${shipping?.name || ""}
${shipping?.street || ""}
${shipping?.zip || ""} ${shipping?.city || ""}
${shipping?.country || ""}
Pickup: ${promoPickup ? "YES" : "NO"}

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
// 5) ORDER UPDATE (PAID)
// --------------------------------------------------
await prisma.order.update({
  where: { orderId: String(orderId) },
  data: {
    status: "paid",
    txHash,
    ethAmount: amountEth?.toString() || null,
    ethPrice: ethPrice?.toString() || null,
    wallet: mintTo || wallet, // optional, falls du's persistieren willst
    backplate,
    backplateCode,
    promo: promo || false,
    promoCode: promoCode || null,
    promoDiscount: promoDiscount ?? 0,
    finalPriceEUR: finalEurSafe,
    promoPickup: promoPickup || false,
    shipName: shipping?.name || "",
    shipStreet: shipping?.street || null,
    shipZip: shipping?.zip || null,
    shipCity: shipping?.city || null,
    shipCountry: shipping?.country || null,
    localImagePath,
    convertedCloudPath: cloudImagePath || null,
    verifyUrl,
    wrikeTaskId,
  },
});

    // --------------------------------------------------
// 6) FLEXPASS MINT
// --------------------------------------------------
if (!mintTo) {
  console.warn("⚠ Mint skipped: no wallet in request or order");
} else {
  try {
    console.log("🪙 Minting Flexblock Production Pass…");

    const mintResult = await mintFlexPass({
      to: mintTo,
      orderId,
    });

    if (mintResult.ok) {
      await prisma.order.update({
        where: { orderId: String(orderId) },
        data: { flexPassTokenId: mintResult.tokenId },
      });
      console.log("✔ FlexPass minted:", mintResult.tokenId);
    } else {
      console.warn("⚠ FlexPass mint failed:", mintResult.error);
    }
  } catch (err) {
    console.error("❌ FLEXPASS MINT ERROR:", err);
  }
}

    console.log("✔ PRODUCTION COMPLETE:", orderId);

    return res.status(200).json({
      ok: true,
      orderId,
      verifyUrl,
    });

  } catch (err) {
    console.error("❌ PRODUCTION ERROR:", err);
    return res.status(500).json({ error: "Production failed", details: err.message });
  }
}