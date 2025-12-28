"use client";

import { useEffect, useState } from "react";

export default function AdminColorsPage() {

  console.log("🔑 ADMIN KEY IST:", process.env.NEXT_PUBLIC_ADMIN_KEY);

  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Beim Laden prüfen: ist Passwort bereits gespeichert?
  useEffect(() => {
    const saved = localStorage.getItem("colorboard_auth");
    if (saved === "yes") {
      setAuthorized(true);
      loadColors();
    } else {
      setLoading(false); // Stoppe Loading, zeige Passwortfeld
    }
  }, []);

  // 2. Passwort prüfen
  function checkKey() {
    const correct = process.env.NEXT_PUBLIC_ADMIN_KEY;

    if (input === correct) {
      localStorage.setItem("colorboard_auth", "yes");
      setAuthorized(true);
      loadColors();
    } else {
      alert("Falsches Passwort");
    }
  }

  // 3. Daten laden
  function loadColors() {
    fetch("/api/colors")
      .then((r) => r.json())
      .then((data) => {
        setColors(data.colors);
        setLoading(false);
      })
      .catch((e) => {
        console.error("LOAD ERROR:", e);
        setLoading(false);
      });
  }

  // 4. Farben toggeln
  function toggleColor(index) {
    const updated = [...colors];
    updated[index].enabled = !updated[index].enabled;
    setColors(updated);
  }

  // 5. Speichern
  function save() {
    fetch("/api/updateColors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors }),
    }).then(() => {
      alert("Colors saved.");
    });
  }

  // --- RENDERING ---

  if (loading) return <p style={{ color: "#fff" }}>Loading…</p>;

  // Passwort-Sperre aktiv
  if (!authorized) {
    return (
      <div style={pageStyle}>
        <h1 style={{ color: "#5eead4" }}>Operativer Zugang</h1>
        <p>Bitte Passwort eingeben:</p>

        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={inputStyle}
        />

        <br /><br />

        <button onClick={checkKey} style={loginButtonStyle}>
          Login
        </button>
      </div>
    );
  }

  // Admin UI
  return (
    <div style={pageStyle}>
      <h1 style={{ color: "#5eead4" }}>Flexblock Color Manager</h1>
      <p style={{ opacity: 0.7 }}>Toggle available backplates.</p>

      <div style={{ marginTop: "30px" }}>
        {colors.map((c, i) => (
          <div key={i} style={colorRowStyle}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: c.hex,
                borderRadius: "6px",
                marginRight: "14px",
                border: "1px solid #333",
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600" }}>{c.name}</div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>{c.code}</div>
            </div>

            <label style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={c.enabled}
                onChange={() => toggleColor(i)}
                style={{ transform: "scale(1.3)" }}
              />
            </label>
          </div>
        ))}

        <button onClick={save} style={saveButtonStyle}>
          Save changes
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("colorboard_auth");
            location.reload();
          }}
          style={logoutButtonStyle}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// --- STYLES ---

const pageStyle = {
  minHeight: "100vh",
  padding: "60px",
  background: "#0b0d10",
  color: "#fff",
  fontFamily: "system-ui",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #333",
  background: "#12161b",
  color: "#fff",
  width: "260px",
};

const loginButtonStyle = {
  background: "#5eead4",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
};

const colorRowStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "14px",
  padding: "10px",
  background: "#111",
  borderRadius: "8px",
};

const saveButtonStyle = {
  marginTop: "25px",
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#00d4aa",
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
};

const logoutButtonStyle = {
  marginTop: "15px",
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#ff6b6b",
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
};
