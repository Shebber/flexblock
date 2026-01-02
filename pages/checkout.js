"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";

import VivamoBanner from "../components/VivamoBanner";
import { FlexblockBuyButton } from "../components/FlexblockBuyButton";
import NftCube from "../components/NftCube"; // Dein neuer Würfel

import { useEthPrice } from "../hooks/useEthPrice";
import { getSexyAmount } from "../lib/getSexyAmount";
import { generateOrderId } from "../utils/orderId";

export default function Checkout() {
  const [data, setData] = useState(null);
  const { ethPrice } = useEthPrice();
  const lastInitSig = useRef("");

  // 1. Daten aus LocalStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("flex_checkout");
    if (stored) {
      setData(JSON.parse(stored));
      return;
    }
    // Fallback
    const newOrder = {
      orderId: generateOrderId(),
      wallet: "",
      nftImage: "",
      contract: "",
      tokenId: "",
      backplate: "",
      promo: null,
      promoCode: null,
      promoPickup: false,
      promoDiscount: 0,
      finalPriceEUR: 0,
      shipping: {},
    };
    localStorage.setItem("flex_checkout", JSON.stringify(newOrder));
    setData(newOrder);
  }, []);

// 2) Order Init API (Server ist Preis-Wahrheit)
useEffect(() => {
  if (!data?.orderId) return;

  // Signatur, wann wir neu init'en müssen (z.B. neuer promoCode)
  const sig = [
    data.orderId,
    data.wallet || "",
    data.backplate || "",
    data.backplateCode || "",
    data.contract || "",
    data.tokenId || "",
    (data.promoCode || "").trim().toUpperCase(),
    JSON.stringify(data.shipping || {}),
  ].join("|");

  if (lastInitSig.current === sig) return;

  async function init() {
    try {
      const res = await fetch("/api/order/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderId,
          wallet: data.wallet,
          backplate: data.backplate,
          backplateCode: data.backplateCode || null,
          nft: {
            contract: data.contract,
            tokenId: data.tokenId,
            image: data.nftImage,
          },
          shipping: data.shipping,
          // ✅ nur noch der Code – Preis berechnet der Server
          promoCode: data.promoCode || null,
        }),
      });

      const json = await res.json().catch(() => null);

      // Init gilt als erledigt für diese Signatur
      lastInitSig.current = sig;

      // ✅ pricing aus Response übernehmen (Server-Wahrheit)
      if (json?.pricing) {
        const merged = {
          ...data,
          ...json.pricing,          // promo, promoCode, promoDiscount, promoPickup, finalPriceEUR
          publicId: json.publicId || data.publicId,
          verifyUrl: json.verifyUrl || data.verifyUrl,
          productionSig: json.productionSig || data.productionSig,
          productionSigTs: json.productionSigTs || data.productionSigTs,

        };

const changed =
  merged.finalPriceEUR !== data.finalPriceEUR ||
  merged.promo !== data.promo ||
  merged.promoCode !== data.promoCode ||
  merged.promoDiscount !== data.promoDiscount ||
  merged.promoPickup !== data.promoPickup ||
  merged.publicId !== data.publicId ||
  merged.verifyUrl !== data.verifyUrl ||
  merged.productionSig !== data.productionSig ||
  merged.productionSigTs !== data.productionSigTs;

        if (changed) {
          localStorage.setItem("flex_checkout", JSON.stringify(merged));
          setData(merged);
        }
      }
    } catch (e) {
      // wenn init fehlschlägt, erlauben wir einen Retry
      lastInitSig.current = "";
      console.error("❌ /api/order/init failed:", e);
    }
  }

  init();
}, [data]);


  // 3. Marquee
  useEffect(() => {
    if (!data) return;
    const lines = [
      "YOUR FLEXBLOCK IS CRAFTED IN SMALL-BATCH PRODUCTION IN BOCHUM, GERMANY.",
      "EACH PIECE IS PRINTED WITH ULTRA-HIGH RESOLUTION ON NEXT-GEN UV SYSTEMS.",
      "COLORS ARE REPRODUCED WITH EXTREME PRECISION AND DEEP CONTRAST LAYERS.",
      "EVERY FLEXBLOCK CARRIES AN NFC TAG FOR INSTANT BLOCKCHAIN VERIFICATION.",
      "PACKED WITH CARE — SHIPPED WORLDWIDE.",
    ];
    const el = document.getElementById("marqueeText");
    if (!el) return;
    let index = 0;
    function cycle() {
      el.style.opacity = 0;
      setTimeout(() => {
        el.innerText = lines[index];
        el.style.opacity = 1;
        index = (index + 1) % lines.length;
      }, 600);
    }
    cycle();
    const interval = setInterval(cycle, 6500);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        <h1>No checkout data found.</h1>
      </div>
    );
  }

  // ETH Berechnung
  let ethToPay = 0;
  if (ethPrice > 0) {
    const raw = data.finalPriceEUR / ethPrice;
    ethToPay = getSexyAmount(raw, "ETH");
  }

  const { contract, tokenId, nftImage, orderId } = data;

  return (
    <div className="checkout-wrapper">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* BACKGROUND VIDEO */}
      <div className="video-section">
        <VivamoBanner />
      </div>

      {/* DARK OVERLAY */}
      <div className="checkout-overlay"></div>

      {/* MARQUEE */}
      <div className="checkout-marquee">
        <div className="checkout-marquee-inner" id="marqueeText"></div>
      </div>

      {/* LEFT SIDE (3D CUBE + INFO) */}
      <div className="checkout-left">
        {/* Der 3D Würfel */}
       <div className="cube-wrapper">
  <NftCube 
    image={nftImage} 
    backplateColor={data.backplate} 
  />
</div>
        {/* Die fehlenden Text-Infos */}
        <div className="nft-info">
          <h2>
            {contract ? `${contract.slice(0, 6)}...${contract.slice(-4)}` : "Loading..."}
          </h2>
          <p>Token #{tokenId}</p>
          <p style={{ marginTop: 10, opacity: 0.7, fontSize: "14px" }}>
            Format: 300 × 300 mm
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (PAYMENT CARD) */}
      <div className="checkout-right">
        <div className="payment-card">
          <h3>Order Summary</h3>

         {/* Promo / Pickup display */}
{data.promo && data.promoCode && (
  <div className="summary-line" style={{ color: "#5eead4" }}>
    <span>
      {data.promoPickup ? `Pickup price (${data.promoCode})` : `Promo (${data.promoCode})`}
    </span>
    <span>{data.promoPickup ? "Fixed price applied" : "Applied"}</span>
  </div>
)}

{/* Discount only if > 0 */}
{Number(data.promoDiscount || 0) > 0 && (
  <div className="summary-line" style={{ color: "#5eead4" }}>
    <span>Discount</span>
    <span>- {data.promoDiscount} €</span>
  </div>
)}


          {/* Total */}
          <div className="summary-line">
          <span>Total</span>
          <span>{ethToPay ? `${ethToPay} ETH` : "…"}</span>
          </div>
          <div className="divider"></div>

         

          {/* Amount to pay */}
          <div className="ape-price-box">
            
          </div>

          {/* Payment Button */}
          <div style={{ marginTop: 20 }}>
            <FlexblockBuyButton
              amountEth={ethToPay}
              orderId={orderId}
              onSuccess={async ({ txHash, orderId }) => {
                await fetch("/api/production", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId,
                    txHash,
                    amountEth: ethToPay,
                    ethPrice,
                    wallet: data.wallet,
                    backplate: data.backplate,
                    backplateCode: data.backplateCode,
                    promo: data.promo || null,
                    promoCode: data.promoCode || null,
                    promoDiscount: data.promoDiscount || null,
                    finalPriceEUR: data.finalPriceEUR,
                    promoPickup: data.promoPickup,
                    shipping: data.shipping,
                    nft: { contract, tokenId, image: nftImage },
                  }),
                });
                localStorage.removeItem("flex_checkout");
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="checkout-footer">
        <p>© {new Date().getFullYear()} Vivamo · All rights reserved.</p>
        <div className="footer-nav">
          <a href="/imprint">Imprint</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>

      {/* GLOBAL CSS */}
      <style jsx global>{`
        /* 1. Layout Basics */
        .checkout-wrapper {
          display: flex;
          padding: 40px;
          gap: 60px;
          position: relative;
          min-height: 100vh;
          background: #0b0d10;
          color: #e6e9ee;
          font-family: system-ui, sans-serif;
          justify-content: center; /* Alles mittig */
        }

        /* 2. Video Background Fix */
        .video-section {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .video-section video,
        .video-section .vivamo-banner {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }

        .checkout-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 8, 12, 0.65);
          backdrop-filter: blur(1px);
          z-index: 1;
        }

        /* 3. Columns Position */
        .checkout-left {
          width: 400px;
          margin-top: 140px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .checkout-right {
          width: 380px;
          margin-top: 140px;
          z-index: 20;
        }

        /* 4. Cube Wrapper (Abstand) */
        .cube-wrapper {
          margin-bottom: 40px;
        }

        /* 5. NFT Info Text (hat gefehlt!) */
        .nft-info {
          text-align: center;
        }
        .nft-info h2 {
          font-family: "Barlow Semi Condensed", sans-serif;
          font-weight: 600;
          font-size: 28px;
          margin: 0;
          letter-spacing: 1px;
        }
        .nft-info p {
          margin: 5px 0 0;
          font-size: 18px;
          color: #ccc;
        }

        /* 6. Payment Card (hat gefehlt!) */
        .payment-card {
          background: rgba(18, 22, 27, 0.85); /* Leicht transparent */
          padding: 30px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
        }

        .payment-card h3 {
          margin-top: 0;
          font-family: "Barlow Semi Condensed", sans-serif;
          font-size: 22px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
        }

        .summary-line,
        .ape-price-box {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 15px 0;
        }

        /* Footer & Marquee */
        .checkout-footer {
          position: fixed;
          bottom: 20px;
          right: 40px;
          opacity: 0.6;
          z-index: 40;
          text-align: right;
          font-size: 13px;
        }
        .footer-nav a {
          margin-left: 15px;
          color: inherit;
          text-decoration: none;
        }
        
        .checkout-marquee {
          position: absolute;
          top: 85px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          text-align: center;
          z-index: 25;
        }
        .checkout-marquee-inner {
          font-family: "Barlow Semi Condensed", sans-serif;
          font-size: 32px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.35);
          letter-spacing: 2px;
          transition: opacity 0.6s ease;
        }
      `}</style>
    </div>
  );
}