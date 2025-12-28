export default function Access() {
  return (
    <div
      style={{
        background: "#0b0d10",
        minHeight: "100vh",
        padding: "60px",
        color: "#e6e9ee",
        fontFamily: "system-ui"
      }}
    >
      <h1
        style={{
          color: "#5eead4",
          marginBottom: "30px"
        }}
      >
        Flexblock Access
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "300px"
        }}
      >
        {/* C-Level Dashboard (Magic Link) */}
        <a
          href="/dashboard"
          style={{
            background: "#12161b",
            padding: "20px",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#e6e9ee",
            textAlign: "center",
            border: "1px solid #5eead4"
          }}
        >
          📊 C-Level Dashboard
        </a>

        {/* Colorboard — Passwortgeschützt über /color-admin */}
        <a
          href="/admin/colors"
          style={{
            background: "#12161b",
            padding: "20px",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#e6e9ee",
            textAlign: "center",
            border: "1px solid #5eead4"
          }}
        >
          🎨 Colorboard Admin
        </a>

        {/* Orders — Passwortgeschützt über /orders */}
        <a
          href="/orders"
          style={{
            background: "#12161b",
            padding: "20px",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#e6e9ee",
            textAlign: "center",
            border: "1px solid #5eead4"
          }}
        >
          📦 Orders
        </a>
      </div>
    </div>
  );
}
