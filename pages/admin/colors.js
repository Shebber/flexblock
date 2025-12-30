"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function normalizeColors(list) {
  const safe = Array.isArray(list) ? list : [];
  return safe.map((c) => ({
    name: String(c?.name || ""),
    code: String(c?.code || ""),
    hex: String(c?.hex || ""),
    enabled: !!c?.enabled,
  }));
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState([]);
  const [baseline, setBaseline] = useState([]); // zuletzt geladener/gespeicherter Stand
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const LOGOUT_URL = useMemo(
    () => "https://logout:logout@nftflexblock.xyz/admin/colors",
    []
  );

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(baseline) !== JSON.stringify(normalizeColors(colors));
  }, [baseline, colors]);

  const loadColors = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/colors", { cache: "no-store" });
      const data = await r.json();

      if (!r.ok) {
        throw new Error(data?.error || `Failed to load colors (${r.status})`);
      }

      const list = normalizeColors(data?.colors);
      setColors(list);
      setBaseline(list);
    } catch (e) {
      console.error("LOAD ERROR:", e);
      alert(`Load failed: ${e?.message || String(e)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadColors();
  }, [loadColors]);

  // ✅ Warnung beim Verlassen, wenn nicht gespeichert
  useEffect(() => {
    const handler = (e) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  function toggleColor(index) {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, enabled: !c.enabled } : c))
    );
  }

  const save = useCallback(async () => {
    try {
      setSaving(true);

      const payload = normalizeColors(colors);

      const r = await fetch("/api/updateColors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: payload }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(data?.error || `Save failed (${r.status})`);
      }

      setBaseline(payload);
      alert("Colors saved.");
    } catch (e) {
      console.error("SAVE ERROR:", e);
      alert(`Save failed: ${e?.message || String(e)}`);
    } finally {
      setSaving(false);
    }
  }, [colors]);

  function reset() {
    if (!hasUnsavedChanges) return;
    if (!confirm("Discard unsaved changes?")) return;
    setColors(baseline);
  }

  if (loading) return <p style={{ color: "#fff" }}>Loading…</p>;

  const logoutDisabled = saving || hasUnsavedChanges;

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
        <h1 style={{ color: "#5eead4", margin: 0 }}>Flexblock Color Manager</h1>

        {hasUnsavedChanges ? (
          <span style={unsavedStyle}>● Unsaved changes</span>
        ) : (
          <span style={savedStyle}>✓ Saved</span>
        )}
      </div>

      <p style={{ opacity: 0.7 }}>Toggle available backplates.</p>

      <div style={{ marginTop: "30px" }}>
        {colors.map((c, i) => (
          <div key={`${c.code || "color"}-${i}`} style={colorRowStyle}>
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
                checked={!!c.enabled}
                onChange={() => toggleColor(i)}
                style={{ transform: "scale(1.3)" }}
              />
            </label>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
          <button
            onClick={save}
            style={{
              ...saveButtonStyle,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            onClick={reset}
            style={{
              ...resetButtonStyle,
              opacity: hasUnsavedChanges ? 1 : 0.5,
              cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
            }}
            disabled={!hasUnsavedChanges || saving}
          >
            Reset
          </button>
        </div>

        <button
          onClick={() => {
            if (logoutDisabled) return;
            window.location.href = LOGOUT_URL;
          }}
          style={{
            ...logoutButtonStyle,
            opacity: logoutDisabled ? 0.5 : 1,
            cursor: logoutDisabled ? "not-allowed" : "pointer",
          }}
          disabled={logoutDisabled}
          title={
            logoutDisabled
              ? hasUnsavedChanges
                ? "Please save or reset changes before logout."
                : "Please wait…"
              : "Logout"
          }
        >
          🔒 Logout
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

const unsavedStyle = {
  color: "#ffcc66",
  fontSize: "13px",
  padding: "4px 10px",
  border: "1px solid #3a2f18",
  borderRadius: "999px",
  background: "#16110a",
};

const savedStyle = {
  color: "#5eead4",
  fontSize: "13px",
  padding: "4px 10px",
  border: "1px solid #1b3a33",
  borderRadius: "999px",
  background: "#0f1413",
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
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#00d4aa",
  border: "none",
  fontWeight: "600",
  color: "#00130f",
};

const resetButtonStyle = {
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#1a1f25",
  border: "1px solid #2b3640",
  fontWeight: "600",
  color: "#e6e9ee",
};

const logoutButtonStyle = {
  marginTop: "15px",
  padding: "10px 20px",
  borderRadius: "8px",
  background: "#ff6b6b",
  border: "none",
  fontWeight: "600",
};
