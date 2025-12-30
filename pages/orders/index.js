"use client";

import { useEffect, useState } from "react";
import { PrismaClient } from "@prisma/client";

// Prisma in SSR
const prisma = new PrismaClient();

// ==============================
// SSR: Orders laden
// ==============================
export async function getServerSideProps() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }
  });

  return {
    props: {
      orders: JSON.parse(JSON.stringify(orders)) // Dates normalisieren
    }
  };
}

// Passwort aus ENV
const ORDER_KEY = process.env.NEXT_PUBLIC_ORDER_ADMIN_KEY || "";

export default function OrdersPage({ orders }) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [openOrder, setOpenOrder] = useState(null);

  // Check localStorage Auth
  useEffect(() => {
    const saved = localStorage.getItem("orders_auth");
    if (saved === "yes") setAuthorized(true);
  }, []);

  function checkKey() {
    if (password === ORDER_KEY) {
      localStorage.setItem("orders_auth", "yes");
      setAuthorized(true);
    } else {
      alert("Falsches Passwort");
    }
  }

  // ================
  // LOGIN SCREEN
  // ================
  if (!authorized) {
    return (
      <div style={styles.page}>
        <h1 style={styles.headline}>Produktionsbereich</h1>
        <p>Bitte Passwort eingeben:</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <br /><br />

        <button onClick={checkKey} style={styles.button}>
          Login
        </button>
      </div>
    );
  }

  // ================
  // MAIN PAGE
  // ================
  return (
    <div style={styles.page}>
      <h1 style={styles.headline}>Orders</h1>

      {orders.length === 0 && (
        <p style={{ opacity: 0.6 }}>Keine Bestellungen vorhanden.</p>
      )}

      <div style={{ marginTop: 20 }}>
        {orders.map((o) => (
          <div key={o.orderId} style={styles.card}>
            {/* ORDER HEADER */}
            <div
              style={styles.orderRow}
              onClick={() => setOpenOrder(openOrder === o.orderId ? null : o.orderId)}
            >
              <div>
                <strong>{o.orderId}</strong>
                <div style={{ opacity: 0.6, fontSize: 12 }}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textTransform: "uppercase", opacity: 0.8 }}>
                {o.status}
              </div>
            </div>

            {/* DETAIL VIEW */}
            {openOrder === o.orderId && (
              <div style={styles.details}>
                {/* Production Image */}
                <h3 style={styles.subhead}>Produktionsbild</h3>
                {o.localImagePath ? (
                  <img
                    src={o.localImagePath}
                    alt="Production"
                    style={styles.prodImg}
                  />
                ) : (
                  <p style={{ opacity: 0.6 }}>Kein Produktionsbild vorhanden</p>
                )}

                {/* NFT */}
                <h3 style={styles.subhead}>NFT</h3>
                <p><strong>Contract:</strong> {o.nftContract}</p>
                <p><strong>Token ID:</strong> {o.nftTokenId}</p>
                <p><strong>Wallet:</strong> {o.wallet}</p>

                {o.nftImage && (
                  <img
                    src={o.nftImage}
                    alt="NFT"
                    style={{ width: 180, borderRadius: 10, marginTop: 10 }}
                  />
                )}

                {/* Payment */}
                <h3 style={styles.subhead}>Zahlung</h3>
                <p>ETH Amount: {o.ethAmount}</p>
                <p>ETH Price: {o.ethPrice}</p>
                {o.txHash && (
                  <p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${o.txHash}`}
                      target="_blank"
                      style={{ color: "#5eead4" }}
                    >
                      TX anzeigen
                    </a>
                  </p>
                )}

                {/* Shipping */}
                <h3 style={styles.subhead}>Versand</h3>
                <p>{o.shipName}</p>
                <p>{o.shipStreet}</p>
                <p>{o.shipZip} {o.shipCity}</p>
                <p>{o.shipCountry}</p>

                {/* Verify */}
                <h3 style={styles.subhead}>NFC / Verify</h3>
                <p><strong>publicId:</strong> {o.publicId}</p>
                <p>
                  <strong>Verify:</strong>{" "}
                  <a href={o.verifyUrl} target="_blank" style={{ color: "#5eead4" }}>
                    {o.verifyUrl}
                  </a>
                </p>

                <button
                  onClick={() => navigator.clipboard.writeText(o.verifyUrl)}
                  style={{ ...styles.button, marginTop: 6 }}
                >
                  Verify-Link kopieren
                </button>

                {/* Wrike */}
                <h3 style={styles.subhead}>Wrike</h3>
                {o.wrikeTaskId ? (
                  <a
                    href={`https://www.wrike.com/open.htm?id=${o.wrikeTaskId}`}
                    target="_blank"
                    style={{ color: "#5eead4" }}
                  >
                    Wrike Task öffnen
                  </a>
                ) : (
                  <p style={{ opacity: 0.6 }}>Keine Wrike-Daten</p>
                )}

                {/* Finish */}
                <h3 style={styles.subhead}>Produktion abschließen</h3>

                <input
                  type="text"
                  placeholder="Tracking URL"
                  defaultValue={o.trackingUrl || ""}
                  onChange={(e) => (o.trackingUrl = e.target.value)}
                  style={styles.input}
                />

                <button
                  style={{ ...styles.button, marginTop: 10 }}
                  onClick={() => finishOrder(o.orderId, o.trackingUrl)}
                >
                  Als "finished" markieren
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =================================
//   Finish order update function
// =================================

async function finishOrder(orderId, trackingUrl) {
  await fetch("/api/order/updateProduction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      status: "finished",
      trackingUrl,
    }),
  });

  alert("Order aktualisiert");
  location.reload();
}

// =================================
//   Styles
// =================================

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#0b0d10",
    color: "#e6e9ee",
    fontFamily: "system-ui",
  },
  headline: {
    color: "#5eead4",
    marginBottom: "20px",
  },
  card: {
    background: "#12161b",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "15px",
    border: "1px solid #1f2228",
  },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  details: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid #333",
  },
  prodImg: {
    width: 320,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 0 20px #0008",
  },
  subhead: {
    marginTop: 25,
    marginBottom: 5,
    color: "#5eead4",
  },
  input: {
    width: "300px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#12161b",
    color: "#e6e9ee",
  },
  button: {
    background: "#5eead4",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#000",
    fontWeight: "bold",
  },
};
