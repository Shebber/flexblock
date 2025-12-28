// middleware.js
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",   // Magic Link weiterhin aktiv
    // "/admin/:path*",     // deaktiviert, sonst blockiert es Colorboard
    // "/orders/:path*",    // deaktiviert, Passwort steuert das selbst
  ],
};
