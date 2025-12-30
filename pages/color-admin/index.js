
import React from "react";

export default function ColorAdmin() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "60px",
        background: "#0b0d10",
        color: "#fff",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ color: "#5eead4" }}>Operative Konsole</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "300px",
        }}
      >
        <a href="/admin/colors" style={btnStyle}>
          🎨 Colorboard
        </a>

        <a href="/orders" style={btnStyle}>
          📦 Orders
        </a>

        {/* OPTIONAL: Basic-Auth "Logout" Workaround */}
        <button
          onClick={() => {
            // Triggert bei vielen Browsern eine neue Auth-Abfrage.
            // Wenn es nicht klappt: Tab schließen oder Inkognito nutzen.
            window.location.href = "https://logout:logout@nftflexblock.xyz/color-admin";
          }}
          style={{ ...btnStyle, background: "#ff6b6b", cursor: "pointer" }}
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
  border: "1px solid #5eead4",
};
