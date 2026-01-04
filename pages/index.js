"use client";
import Header from "../components/Header";
import WalletDisplay14 from "../components/WalletDisplay14";

import FaqSection from "../components/FaqSection";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { FLEXBLOCK_BASE_PRICE_EUR } from "../lib/pricing";

import WalletStatus from "../components/WalletStatus";
import ClientOnly from "../components/ClientOnly";
import Toast from "../components/Toast";

import { getAvailableBackplateColors } from "../utils/loadBackplateColors";
import { useApePrice } from "../hooks/useApePrice";
import { generateOrderId } from "../utils/orderId";

export default function Home() {
  const [toast, setToast] = useState(null);
  const [builderStarted, setBuilderStarted] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [walletActions, setWalletActions] = useState(null);
  const { address, isConnected } = useAccount();

  // Pricing
  const { apePrice } = useApePrice();
  const [finalPrice, setFinalPrice] = useState(FLEXBLOCK_BASE_PRICE_EUR);
 
  // NFT + ownership
  const { chain } = useAccount();
  const [backplate, setBackplate] = useState(null);
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [nftImage, setNftImage] = useState(null);
  const [isOwnerValid, setIsOwnerValid] = useState(false);
  const [nftChainId, setNftChainId] = useState(null);

  // Shipping
  const [shipName, setShipName] = useState("");
  const [shipStreet, setShipStreet] = useState("");
  const [shipZip, setShipZip] = useState("");
  const [shipCountry, setShipCountry] = useState("");

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoPickup, setPromoPickup] = useState(false);

// Backplate-Daten (DB first, JSON fallback) – immer safe Array
const [backplateColors, setBackplateColors] = useState(() => {
  try {
    const raw = getAvailableBackplateColors();

    // ✅ falls util mal {colors:[...]} liefert
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.colors)) return raw.colors;

    return [];
  } catch {
    return [];
  }
});

useEffect(() => {
  let alive = true;

  (async () => {
    try {
      const res = await fetch("/api/colors", { cache: "no-store" });
      const json = await res.json();

      const list = Array.isArray(json?.colors) ? json.colors : [];
      const enabled = list.filter((c) => c && c.enabled && c.hex);

      if (alive) setBackplateColors(enabled.length ? enabled : getAvailableBackplateColors());
    } catch (e) {
      console.warn("⚠ could not load /api/colors, using local fallback", e);
      if (alive) setBackplateColors(getAvailableBackplateColors());
    }
  })();

  return () => { alive = false; };
}, []);


const backplateObj = useMemo(() => {
  // ✅ findet nur, wenn array - sonst null
  return Array.isArray(backplateColors)
    ? backplateColors.find((c) => c.hex === backplate) || null
    : null;
}, [backplateColors, backplate]);


  const shippingComplete =
    shipName.trim() !== "" &&
    shipStreet.trim() !== "" &&
    shipZip.trim() !== "" &&
    shipCountry.trim() !== "";

  // ---------------------------------------------------
  // Flow: Start-Button im Hero
  // ---------------------------------------------------
  function handleStartBuilder() {
    if (!isConnected) {
      setToast("Please connect your wallet to proceed.");
      return;
    }
    setBuilderStarted(true);
    setShowShipping(false);

    setTimeout(() => {
      const el = document.getElementById("verify-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }

  // ---------------------------------------------------
  // Backplate Auswahl (nur mit Wallet)
  // ---------------------------------------------------
  function handleSelectBackplate(hex) {
    if (!isConnected) {
      setToast("Please connect your wallet first.");
      return;
    }
    setBackplate(hex);
  }
// ---------------------------------------------------
  // NFT Ownership Check
  // ---------------------------------------------------
  async function verifyOwnership() {
    setChecking(true);
    setError("");
    setIsOwnerValid(false);
    setNftImage(null);
    setNftChainId(null);
    setBackplate(null);
    setPromoResult(null);
    setPromoPickup(false);
    setShowShipping(false);
    setFinalPrice(FLEXBLOCK_BASE_PRICE_EUR);

    try {
      if (!isConnected || !address) {
        setError("Please connect your wallet first.");
        setChecking(false);
        return;
      }

      // 1. Owner Check
      const res = await fetch("/api/checkOwner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract,
          tokenId,
          wallet: address,
          chainId: chain?.id || null, // Hier ist chain?.id okay (als "Präferenz")
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        if (data.type === "OWNERSHIP_FAILED") {
          setError("You do not own this NFT.");
        } else if (data.type === "TOKEN_NOT_FOUND") {
          setError("This token does not exist on-chain.");
        } else if (data.type === "NOT_NFT") {
          setError("This contract is not an NFT collection.");
        } else {
          setError(data.message || "Verification failed.");
        }
        return;
      }

      // ✅ Besitzer stimmt
      setIsOwnerValid(true);
      
      // WICHTIG: Wir speichern die gefundene ChainID, falls wir sie später brauchen
      // (z.B. wenn du sie im State für den Checkout brauchst)
      const detectedChainId = data.chainId;
      setNftChainId(detectedChainId);


      // 2. Metadaten / Bild laden
      try {
        const metaRes = await fetch("/api/fetchMetadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract,
            tokenId,
            wallet: address,
            // 🔴 ALT (FALSCH): chainId: chain?.id 
            // 🟢 NEU (RICHTIG): Wir nehmen die ID, wo das NFT gefunden wurde!
            chainId: detectedChainId, 
          }),
        });

        const meta = await metaRes.json();
        
        // Logge mal, was zurückkommt, falls das Bild immer noch fehlt
        console.log("Metadata Result:", meta);

        if (meta.image) {
            setNftImage(meta.image);
        } else {
            // Fallback, falls Metadaten da sind, aber kein Bild
            console.warn("No image found in metadata");
        }
        
      } catch (e) {
        console.error("Metadata fetch failed:", e);
        // Kein setError hier, da der User trotzdem weitermachen darf (ggf. Placeholder Bild)
      }

    } catch (e) {
      setError(e.message || "Verification failed.");
    } finally {
      setChecking(false);
    }
  }
  // ---------------------------------------------------
  // Promo Code prüfen
  // ---------------------------------------------------
  async function applyPromo() {
    setPromoResult(null);
    setPromoPickup(false);
    setFinalPrice(FLEXBLOCK_BASE_PRICE_EUR);

    const res = await fetch("/api/checkPromo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode }),
    });

    const data = await res.json();

    if (!data.ok) {
      setPromoResult({ ok: false, message: data.message });
      return;
    }

    // Normaler Rabatt 
    if (data.mode === "normal") {
      setPromoResult({ ...data, ok: true });
      setPromoPickup(false);
      setFinalPrice(FLEXBLOCK_BASE_PRICE_EUR - (data.discount || 0));
    }

    // Pickup 
    if (data.mode === "pickup") {
      setPromoResult({ ...data, ok: true });
      setPromoPickup(true);
      setFinalPrice(data.price);
    }
  }

  // ---------------------------------------------------
  // Proceed → Shipping anzeigen
  // ---------------------------------------------------
  function handleOpenShipping() {
    if (!isConnected || !isOwnerValid || !nftImage || !backplate) return;

    setShowShipping(true);

    setTimeout(() => {
      const el = document.getElementById("shipping-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
return (
  <>
     {/* Blurry Lines Add On */}
       <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="hudEdge">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise"/>
         <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.7" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
       </svg>



    {/* HEADER IMMER ALS ALLERERSTES RENDERN – OHNE WHITESPACE DAVOR */}
    <div className="topbar glass">
      <div className="header-left">
        <img src="/logo.svg" className="logo-flexblock glow" />
      </div>
<div className="header-right wallet-slot">
  <ClientOnly>
    <WalletStatus ui="none" onActions={setWalletActions} />
  </ClientOnly>

  <div className="wallet-device-wrapper">
    <WalletDisplay14 walletActions={walletActions} />
  </div>
</div>
</div>


      {/* ───────────────────── HERO ───────────────────── */}
<section className="hero">
  <div className="hero-img-fixed">
    <img src="/hero-hop.jpg" alt="Flexblock Hero" />
  </div>
   <div className="hero-inner">
    <div className="hero-content">
      <h1>
        Bring your NFT
        <br />
        to life.
      </h1>
      <p>
        Premium acrylic wall art with embedded NFC and blockchain
        verification.
      </p>
     <button className="hero-btn hero-btn--mobileTop" onClick={handleStartBuilder}>
  Build your Flexblock
</button>

    </div>
  </div>
</section>

      {/* ───────────────────── FILMSTRIP ───────────────────── */}
      <section className="filmstrip">
        <div className="filmstrip-track">
          {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((n) => (
            <img key={n + Math.random()} src={`/gallery/${n}.jpg`} />
          ))}
        </div>
      </section>

      {/* ───────────────────── BUILDER FLOW ───────────────────── */}
      {builderStarted && (
        <>
          {/* STEP 2 · NFT VERIFY */}
          <section className="cinematic-verify" id="verify-section">
            <h2 className="cinematic-step-label">Step 2 · Verify your NFT</h2>
            <p className="cinematic-sub">Connect your wallet and prove ownership of the NFT you want to turn into a Flexblock.</p>

            <div className="verify-box">
              {/* Eingabefelder */}
              {/* Eingabefelder */}
<div className="verify-fields">
  <div className="blurry-field contract">
    <input
      className="verify-input"
      placeholder="Contract address (0x…)"
      value={contract}
      onChange={(e) => setContract(e.target.value)}
    />
  </div>

  <div className="blurry-field token">
    <input
      className="verify-input"
      placeholder="Token ID"
      value={tokenId}
      onChange={(e) => setTokenId(e.target.value)}
    />
  </div>

  <button
    className="btn-gradient"
    disabled={!isConnected || checking || !contract || !tokenId}
    onClick={verifyOwnership}
  >
    {checking ? "Checking…" : "Verify"}
  </button>
</div>

              {/* Fehlermeldung */}
              {error && <p className="verify-error">{error}</p>}

              {/* Erfolg – NFT Preview + clean Verified Indicator */}
              {/* Erfolg – NFT Preview + Verified rechts (Showcase clean) */}
{/* Erfolg – NFT Preview + Step 3 rechts + Colorboard direkt drunter */}
{isOwnerValid && nftImage && (
  <>
    <div className="verify-layout verify-success">
      {/* NFT mit dynamischem Glow */}
      <div
        className="glow-frame"
        style={{
          boxShadow: backplate
            ? `0 0 55px ${backplate}cc, 0 0 100px ${backplate}77`
            : "0 0 55px rgba(94,234,212,0.55), 0 0 100px rgba(94,234,212,0.35)",
          borderRadius: 16,
          transition: "0.25s ease",
        }}
      >
        <img
          src={nftImage}
          alt="NFT Preview"
          className="preview-img"
          style={{
            border: backplate ? `2px solid ${backplate}` : "2px solid #5eead4",
            borderRadius: 14,
            display: "block",
            background: "transparent",
          }}
        />
      </div>

      {/* Rechts: Ownership + Step 3 Headline */}
      <div className="verified-panel">
        <div className="verified-head">
          <span className="verified-check">✓</span>
          <span className="verified-title">Ownership verified</span>
        </div>

        <div className="verified-stepwrap">
          <div className="cinematic-step-label small" style={{ margin: "0 0 6px 0" }}>
            Step 3 · Choose backplate
          </div>

          <p className="cinematic-sub" style={{ margin: 0 }}>
            Match the acrylic edge and background to your artwork.
          </p>

          <p
            className="cinematic-sub"
            style={{ margin: "10px 0 0", opacity: 0.65, fontSize: "14px" }}
          >
          </p>
        </div>
      </div>
    </div>

    {/* Colorboard direkt unter dem Rahmen */}
    <div className="backplate-inline" id="backplate-section">
      <div className="color-grid">
       {(Array.isArray(backplateColors) ? backplateColors : []).map((c) => (
          <div
            key={c.code}
            className={`color-swatch ${backplate === c.hex ? "selected" : ""}`}
            onClick={() => handleSelectBackplate(c.hex)}
            style={{ backgroundColor: c.hex }}
          >
            <span className="color-label">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  </>
)}

            </div>
          </section>

          {/* STEP 3 · BACKPLATE (legacy disabled – now inline) */}
{false && isConnected && isOwnerValid && nftImage && (
  <section
    className="backplate-section cinematic-section"
    id="backplate-section-legacy"
  >
    <h2 className="cinematic-step-label">Step 3 · Choose backplate</h2>

    <p className="cinematic-sub">
      Match the acrylic edge and background to your artwork.
    </p>

    <p
      className="cinematic-sub"
      style={{
        marginTop: "-4px",
        opacity: 0.65,
        fontSize: "14px",
      }}
    >
      Flexblock dimensions: <strong>300 × 300 mm</strong>
    </p>

    <div className="color-grid">
      {backplateColors.map((c) => (
        <div
          key={c.code}
          className={`color-swatch ${backplate === c.hex ? "selected" : ""}`}
          onClick={() => handleSelectBackplate(c.hex)}
          style={{ backgroundColor: c.hex }}
        >
          <span className="color-label">{c.name}</span>
        </div>
      ))}
    </div>
  </section>
)}


          {/* STEP 3.5 · PROMO CODE + PROCEED */}
          {isConnected && isOwnerValid && nftImage && (
            <div className="container cinematic-card" id="promo-section">
              <h3 className="cinematic-step-label small">Optional: Promo Code</h3>
              <p className="cinematic-sub">Redeem a discount or unlock pickup pricing.</p>
              <div className="row" style={{ marginTop: 20 }}>
                <input
                  className="verify-input"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn-gradient"
                  onClick={applyPromo}
                  disabled={!promoCode}
                >
                  Apply
                </button>
              </div>

             {promoResult && (
  <div
    style={{
      marginTop: 14,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "15px",
      fontWeight: 500,
      color: promoResult.ok ? "#5eead4" : "#ff5ce1",
    }}
  >
    {/* ICON */}
    {promoResult.ok ? (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "2px solid #5eead4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5eead4",
          fontSize: "12px",
          boxShadow: "0 0 8px #5eead488",
        }}
      >
        ✓
      </div>
    ) : (
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: "2px solid #ff5ce1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff5ce1",
          fontSize: "12px",
          boxShadow: "0 0 8px #ff5ce188",
        }}
      >
        ✗
      </div>
    )}

    {/* MESSAGE */}
    <span>{promoResult.message}</span>
  </div>
)}


              {/* Proceed → zeigt erst dann Shipping */}
              {backplate && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 24,
                  }}
                >
                  <button
                    className="btn-gradient"
                    onClick={handleOpenShipping}
                  >Proceed to checkout →</button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 · SHIPPING / PICKUP */}
          {showShipping &&
            backplate &&
            isConnected &&
            isOwnerValid &&
            nftImage && (
              <div className="container" id="shipping-section">
                <div className="card cinematic-card">
                  {/* Titel */}
                  <h3 className="cinematic-step-label small">
  {promoPickup
    ? <>Step 4&nbsp;·&nbsp;Pickup details</>
    : <>Step 4&nbsp;·&nbsp;Shipping details</>}
</h3>

                  <p className="cinematic-sub">
  {promoPickup
    ? <>Pickup activated — only your<br />name is required.</>
    : <>We carefully pack and ship your Flexblock worldwide.</>}
</p>


                  {/* FORM */}
                  <div className="form-grid">
                    {/* Name immer nötig */}
                    <input
                      placeholder="Full name"
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                    />

                    {/* Shipping deaktiviert, wenn Pickup aktiv */}
                    {!promoPickup && (
                      <>
                        <input
                          placeholder="Street + house number"
                          value={shipStreet}
                          onChange={(e) => setShipStreet(e.target.value)}
                        />

                        <input
                          placeholder="ZIP / City"
                          value={shipZip}
                          onChange={(e) => setShipZip(e.target.value)}
                        />

                        <input
                          placeholder="Country"
                          value={shipCountry}
                          onChange={(e) => setShipCountry(e.target.value)}
                        />
                      </>
                    )}
                  </div>

                  {/* Check, ob alles bereit ist */}
                  {(promoPickup ? shipName.trim() !== "" : shippingComplete) && (
                    <button
                      className="continue-checkout btn-gradient"
                      onClick={() => {
                        const orderId = generateOrderId();

                        const payload = {
                          orderId,
                          contract,
                          tokenId,
                          nftImage,
                          nftChainId,

                          // Backplate
                          backplate,
                          backplateCode: backplateObj?.code || null,

                          // Pricing
                          
                          apePrice,
                          promo: !!promoResult && !!promoResult.ok,
                          promoCode: promoCode || null,
                          promoDiscount: promoResult?.discount ?? 0,
                          finalPriceEUR: finalPrice,
                          promoPickup,

                          // Shipping or Pickup
                          shipping: {
                            name: shipName,
                            street: promoPickup ? null : shipStreet,
                            zip: promoPickup ? null : shipZip,
                            country: promoPickup ? null : shipCountry,
                            pickup: promoPickup,
                          },

                          wallet: address,
                        };

                        localStorage.setItem(
                          "flex_checkout",
                          JSON.stringify(payload)
                        );

                        window.location.href = `/checkout`;
                      }}
                    >
                      Continue to checkout →
                    </button>
                  )}
                </div>
              </div>
            )}
        </>
      )}

     {/* ───────────────────── FOOTER ───────────────────── */}
      <footer className="footer">
        {/* Social Icons */}
        <div className="footer-social">
          <a
            href="https://x.com/nftflexblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/icons/x.svg" alt="X" />
          </a>

          <a
            href="https://instagram.com/nft_flexblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/icons/instagram.svg" alt="Instagram" />
          </a>
        </div>

        {/* Divider Line */}
        <div className="footer-divider"></div>

        {/* Navigation - HIER IST DER NEUE LINK */}
        <div className="footer-nav">
          <a href="/faq">FAQ</a>  {/* 🟢 Neu: Steht am besten am Anfang */}
          <a href="/imprint">Imprint</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>

        {/* Branding */}
        <div className="footer-brand">
          <p>© {new Date().getFullYear()} Flexblock · Powered by Vivamo</p>
        </div>
      </footer>

      {/* ───────────────────── CSS ───────────────────── */}
      <style jsx>{`
        .footer {
          background-color: #0b0d10; /* Dein dunkler Hintergrund */
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 60px 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #9ca3af;
          font-family: "Barlow Semi Condensed", sans-serif;
        }

        /* Socials */
        .footer-social img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}


.footer-social a {
  color: #e6e9ee; /* Icon-Farbe */
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s, color 0.2s;
}

.footer-social a:hover {
  opacity: 1;
  transform: translateY(-2px);
  color: #5eead4; /* optional: Icon on hover teal */
}
.footer-social {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
  align-items: center; /* ✅ vertikal sauber mittig */
}

.footer-social a {
  display: inline-flex;         /* ✅ kein “baseline”-Absacken */
  align-items: center;
  justify-content: center;
  line-height: 0;               /* ✅ killt baseline-offset */
}


        /* Divider */
        .footer-divider {
          width: 60px;
          height: 2px;
          background: #5eead4; /* Dein Teal-Akzent */
          margin-bottom: 30px;
          opacity: 0.5;
        }

        /* Nav Links */
        .footer-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 30px; /* Abstand zwischen den Links */
          margin-bottom: 30px;
        }
        .footer-nav a {
          color: #e6e9ee;
          text-decoration: none;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.2s;
        }
        .footer-nav a:hover {
          color: #5eead4; /* Hover in Teal */
        }

        /* Brand */
        .footer-brand p {
          font-size: 13px;
          opacity: 0.4;
          margin: 0;
        }
      `}</style>
    </>
  );
}