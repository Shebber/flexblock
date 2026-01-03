import { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";


export async function getServerSideProps(context) {
  const { req, res } = context;

  // ✅ 1) Serverseitiger NextAuth-Guard
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin?callbackUrl=/dashboard",
        permanent: false,
      },
    };
  }

  // ✅ 2) Host dynamisch ermitteln (lokal + Vercel)
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  // ✅ 3) Session-Cookies an den API-Call weiterreichen
  const summaryRes = await fetch(`${baseUrl}/api/treasury/summary`, {
    headers: {
      cookie: req.headers.cookie || "",
    },
  });

  const summary = await summaryRes.json().catch(() => ({ error: "Invalid JSON" }));

  return { props: { summary } };
}

export default function Dashboard({ summary }) {
  const [showEditor, setShowEditor] = useState(false);
  // 🟢 NEU: State für ETH statt APE
  const [newEth, setNewEth] = useState("");
  const [reason, setReason] = useState("");

  async function adjust() {
    await fetch("/api/treasury/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // 🟢 NEU: Sende 'newEth' an die API
      body: JSON.stringify({ newEth, reason }),
    });
    window.location.reload();
  }

  // Fallback, falls API Fehler wirft oder leer ist
  if (!summary || summary.error) {
    return <div style={{ padding: "40px", color: "red" }}>Fehler beim Laden der Treasury-Daten.</div>;
  }

  return (
    <div style={{
      padding: "40px",
      background: "#0b0d10",
      minHeight: "100vh",
      color: "#e6e9ee",
      fontFamily: "system-ui"
    }}>

      {/* Header */}
      <h1 style={{ color: "#5eead4", marginBottom: "10px" }}>
        Flexblock Treasury (ETH)
      </h1>

      {/* Großer Gesamtwert in EUR */}
      <div style={{
        fontSize: "48px",
        fontWeight: "bold",
        marginBottom: "30px"
      }}>
        {/* 🟢 UPDATE: Berechnung auf ETH Basis */}
        {(summary.treasuryEth * summary.ethPriceEur).toFixed(2)} €
      </div>

      {/* Stats Card Row */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "40px"
      }}>
        {/* 🟢 UPDATE: Labels und Values auf ETH */}
        <Card title="ETH Bestand" value={`${summary.treasuryEth.toFixed(4)} ETH`} />
        <Card title="ETH Kurs" value={`${summary.ethPriceEur.toFixed(2)} €`} />
        
        <Card title="24h Änderung"
              value={`${summary.priceChange24h.toFixed(2)}%`}
              color={summary.priceChange24h >= 0 ? "#5eead4" : "#ff6b6b"}
        />
        <Card title="Marktsignal"
              value={summary.signal === "green" ? "🟢 Guter Zeitpunkt" : "🔴 Schlechter Zeitpunkt"}
        />
      </div>

      {/* Umsatz */}
      <h2 style={{ marginBottom: "10px" }}>Gesamtumsatz (ETH)</h2>
      <div style={{
        background: "#12161b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "40px"
      }}>
        <p style={{ fontSize: "24px" }}>
          {/* 🟢 UPDATE: totalEthCollected */}
          {summary.totalEthCollected.toFixed(4)} ETH
        </p>
        <p>{(summary.totalEthCollected * summary.ethPriceEur).toFixed(2)} €</p>
      </div>

      {/* Treasury Log */}
      <h2 style={{ marginBottom: "10px" }}>Treasury Protokoll</h2>
      <div style={{
        background: "#12161b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "30px"
      }}>
        {(!summary.adjustments || summary.adjustments.length === 0) && <p>Noch keine Anpassungen.</p>}

        {summary.adjustments && summary.adjustments.map((a) => (
          <div key={a.id} style={{ marginBottom: "20px", borderBottom: "1px solid #222", paddingBottom: "10px" }}>
            <b>{new Date(a.createdAt).toLocaleString()}</b>
            {/* 🟢 UPDATE: Anpassungs-Logik auf ETH Felder mappen */}
            <p>{a.previousEth} → {a.newEth} ETH ({a.deltaEth > 0 ? "+" : ""}{a.deltaEth})</p>
            <p>Grund: {a.reason}</p>
            <p style={{ opacity: 0.7 }}>Geändert von: {a.changedBy}</p>
          </div>
        ))}
      </div>

      {/* Editor Button */}
      <button
        onClick={() => setShowEditor(true)}
        style={{
          background: "#5eead4",
          border: "none",
          padding: "12px 20px",
          borderRadius: "10px",
          cursor: "pointer",
          marginBottom: "20px",
          color: "#000",
          fontWeight: "bold"
        }}
      >
        Treasury anpassen
      </button>

      {/* Editor Modal / Area */}
      {showEditor && (
        <div style={{
          background: "#12161b",
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "400px"
        }}>
          <input
            type="number"
            step="0.0001"
            placeholder="Neuer tatsächlicher ETH-Bestand"
            value={newEth}
            onChange={(e) => setNewEth(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Grund der Anpassung (z.B. Gas Fees, Auszahlung...)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ ...inputStyle, height: "100px", resize: "vertical" }}
          />

          <button
            onClick={adjust}
            style={{
              marginTop: "10px",
              background: "#5eead4",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              color: "#000",
              fontWeight: "bold"
            }}
          >
            Speichern
          </button>
        </div>
      )}
    </div>
  );
}

// Kleine Helper Component für die Cards
function Card({ title, value, color }) {
  return (
    <div style={{
      background: "#12161b",
      padding: "20px",
      borderRadius: "12px",
      flex: "1 1 200px",
      minWidth: "200px"
    }}>
      <div style={{ opacity: 0.7, marginBottom: "8px", fontSize: "14px" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold", color: color || "#fff" }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #333",
  background: "#0b0d10",
  color: "#e6e9ee",
  outline: "none"
};