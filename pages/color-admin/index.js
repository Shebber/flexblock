console.log("💥 BUILD-TEST: ADMIN_KEY = ", process.env.NEXT_PUBLIC_ADMIN_KEY);


import { useState, useEffect } from "react";

// ENV auf Dateiebene (Browser-sicher)
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ""; 

export default function ColorAdmin() {
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("coloradmin_auth");
    if (saved === "yes") setAuthorized(true);
  }, []);

  function checkKey() {
    console.log("Check entered:", input);
    console.log("Check ADMIN_KEY:", ADMIN_KEY);

    if (input === ADMIN_KEY) {
      localStorage.setItem("coloradmin_auth", "yes");
      setAuthorized(true);
    } else {
      alert("Falsches Passwort");
    }
  }

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "60px",
          background: "#0b0d10",
          color: "#fff",
          fontFamily: "system-ui"
        }}
      >
        <h1 style={{ color: "#5eead4" }}>Operativer Zugang</h1>
        <p>Bitte Passwort eingeben:</p>

        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#12161b",
            color: "#fff",
            width: "260px"
          }}
        />

        <br /><br />

        <button
          onClick={checkKey}
          style={{
            background: "#5eead4",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // Operative Konsole
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px",
        background: "#0b0d10",
        color: "#fff",
        fontFamily: "system-ui"
      }}
    >
      <h1 style={{ color: "#5eead4" }}>Operative Konsole</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "300px"
        }}
      >
        <a href="/admin/colors" style={btnStyle}>
          🎨 Colorboard
        </a>

        <a href="/orders" style={btnStyle}>
          📦 Orders
        </a>

        <button
          onClick={() => {
            localStorage.removeItem("coloradmin_auth");
            location.reload();
          }}
          style={{ ...btnStyle, background: "#ff6b6b" }}
        >
          🔒 Logout
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#12161b",
  padding: "20px",
  borderRadius: "12px",
  textDecoration: "none",
  color: "#e6e9ee",
  textAlign: "center",
  border: "1px solid #5eead4"
};
