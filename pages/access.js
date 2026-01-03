import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Access() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  return (
    <div
      style={{
        background: "#0b0d10",
        minHeight: "100vh",
        padding: "60px",
        color: "#e6e9ee",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ color: "#5eead4", marginBottom: "20px" }}>
        Flexblock Access
      </h1>

      {/* MAGIC LINK LOGIN */}
      <div
        style={{
          background: "#12161b",
          border: "1px solid #5eead4",
          borderRadius: "12px",
          padding: "18px",
          maxWidth: "420px",
          marginBottom: "30px",
        }}
      >
        <div style={{ marginBottom: 10, opacity: 0.85 }}>
          Login via Magic Link (10 Min gültig)
        </div>

        {status === "loading" ? (
          <div style={{ opacity: 0.7 }}>Loading session…</div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = email.trim();
              if (!val) return;

              signIn("email", {
                email: val,
                callbackUrl: "/dashboard",
              });
            }}
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              type="email"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "#0b0d10",
                color: "#e6e9ee",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #5eead4",
                background: "transparent",
                color: "#e6e9ee",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        )}
      </div>

      {/* LINKS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "300px",
        }}
      >
        <a
          href="/dashboard"
          style={linkStyle}
        >
          📊 C-Level Dashboard
        </a>

        <a
          href="/admin/colors"
          style={linkStyle}
        >
          🎨 Colorboard Admin
        </a>

        <a
          href="/orders"
          style={linkStyle}
        >
          📦 Orders
        </a>
      </div>
    </div>
  );
}

const linkStyle = {
  background: "#12161b",
  padding: "20px",
  borderRadius: "12px",
  textDecoration: "none",
  color: "#e6e9ee",
  textAlign: "center",
  border: "1px solid #5eead4",
};
