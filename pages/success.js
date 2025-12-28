"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get("order");
    if (!orderId) return;

    fetch(`/api/getOrder?order=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data.order || null);
        setLoading(false);
      });
  }, []);

  function copyLink(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: "#ddd", fontFamily: "system-ui" }}>
        Loading…
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#ccc",
          fontFamily: "system-ui",
        }}
      >
        <h1>Order not found</h1>
        <p>Your order could not be located.</p>
      </div>
    );
  }

  const explorerUrl = order.txHash
    ? `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${order.txHash}`
    : null;

  const verificationLink = `https://nftflexblock.xyz/verify/${order.publicId}`;

  return (
    <div style={styles.pageWrapper}>
      {/* --- Background Overlay --- */}
      <div style={styles.background}></div>

      {/* --- HEADER --- */}
      <h1 style={styles.heading}>Order Confirmed 🎉</h1>

      <p style={styles.subHeading}>
        Your Flexblock is now being prepared for production.
      </p>

      {/* --- MAIN CARD --- */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Order Details</h2>

        <div style={styles.kv}>
          <span style={styles.k}>Order ID</span>
          <span>{order.orderId}</span>
        </div>

        <div style={styles.kv}>
          <span style={styles.k}>Wallet</span>
          <span>{order.wallet || "—"}</span>
        </div>

        <div style={styles.kv}>
          <span style={styles.k}>APE Amount</span>
          <span>{order.apeAmount?.toString()}</span>
        </div>

        <div style={styles.kv}>
          <span style={styles.k}>Backplate</span>
          <span>{order.backplate || "—"}</span>
        </div>

        <div style={styles.kv}>
          <span style={styles.k}>Status</span>
          <span>{order.status}</span>
        </div>

        {order.txHash && (
          <div style={styles.kv}>
            <span style={styles.k}>Transaction</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {order.txHash.slice(0, 12)}…
            </a>
          </div>
        )}

        {order.trackingUrl && (
          <div style={styles.kv}>
            <span style={styles.k}>Tracking</span>
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              {order.trackingUrl}
            </a>
          </div>
        )}

        {/* --- Verification Link Block --- */}
        <div style={{ marginTop: "28px" }}>
          <p style={styles.verificationLabel}>Your verification link</p>

          <div style={styles.verificationBox}>
            <a href={verificationLink} target="_blank" style={styles.verifyLink}>
              {verificationLink}
            </a>

            <button
              onClick={() => copyLink(verificationLink)}
              style={styles.copyBtn}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* --- Shipping Notice --- */}
        <div style={styles.shippingNotice}>
          <p style={{ margin: 0 }}>
            For shipping updates, please bookmark this page.  
            Your tracking link will appear here automatically once your Flexblock has been dispatched.
          </p>
        </div>
      </div>

      {/* --- NFT BLOCK --- */}
      <div style={styles.nftCard}>
        <h3 style={styles.nftTitle}>Your NFT</h3>

        {order.nftImage ? (
          <img
            src={order.nftImage}
            alt="NFT"
            style={styles.nftImage}
          />
        ) : (
          <p style={{ opacity: 0.6 }}>NFT preview unavailable</p>
        )}

        <p style={styles.nftSubtitle}>Produced from NFT #{order.nftTokenId}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* --------------------------   STYLES   ----------------------------- */
/* ------------------------------------------------------------------ */

const styles = {
  pageWrapper: {
    position: "relative",
    minHeight: "100vh",
    padding: "40px",
    fontFamily: "'Barlow Semi Condensed', system-ui",
    color: "#e6e6e6",
  },

  background: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 30% 20%, #240030 0%, #0b0d10 70%)",
    opacity: 0.9,
    zIndex: -1,
    backdropFilter: "blur(4px)",
  },

  heading: {
    fontSize: "40px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    marginBottom: "10px",
    color: "#5eead4",
    textShadow: "0 0 12px rgba(94,234,212,0.25)",
  },

  subHeading: {
    opacity: 0.8,
    marginBottom: "30px",
    fontSize: "20px",
  },

  card: {
    background: "rgba(18,22,27,0.7)",
    border: "1px solid rgba(255,0,255,0.15)",
    borderRadius: "18px",
    padding: "26px",
    marginBottom: "40px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 0 30px rgba(255,0,255,0.08)",
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: "24px",
    marginBottom: "18px",
  },

  kv: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    marginBottom: "10px",
    fontSize: "16px",
  },

  k: {
    opacity: 0.6,
  },

  link: {
    color: "#5eead4",
    textDecoration: "none",
  },

  verificationLabel: {
    opacity: 0.7,
    marginBottom: "6px",
  },

  verificationBox: {
    background: "#0d0f12",
    border: "1px solid rgba(94,234,212,0.3)",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  verifyLink: {
    color: "#5eead4",
    textDecoration: "none",
    fontSize: "14px",
    wordBreak: "break-all",
  },

  copyBtn: {
    background: "#5eead4",
    border: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#0b0d10",
    fontWeight: 600,
  },

  shippingNotice: {
    marginTop: "24px",
    padding: "16px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: 1.4,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  nftCard: {
    background: "rgba(18,22,27,0.7)",
    border: "1px solid rgba(94,234,212,0.25)",
    borderRadius: "18px",
    padding: "30px",
    textAlign: "center",
    backdropFilter: "blur(8px)",
    boxShadow: "0 0 30px rgba(94,234,212,0.1)",
  },

  nftImage: {
    width: "300px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 0 25px rgba(94,234,212,0.2)",
  },

  nftTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "22px",
    color: "#5eead4",
  },

  nftSubtitle: {
    opacity: 0.6,
    fontSize: "14px",
  },
};
