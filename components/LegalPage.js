export default function LegalPage({ title, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0d10",
        color: "#e6e9ee",
        padding: "60px 20px 80px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
      }}
    >
      {/* Heading */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "38px",
          marginBottom: "28px",
          background: "linear-gradient(90deg,#5eead4,#9ef7ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {title}
      </h1>

      {/* Card */}
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "34px 40px",
          background: "rgba(18,22,27,0.9)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
          lineHeight: "1.65",
          fontSize: "15.5px",
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          marginTop: "40px",
          opacity: 0.35,
          fontSize: "13px",
        }}
      >
        © {new Date().getFullYear()} Flexblock · All rights reserved.
      </p>
    </div>
  );
}
