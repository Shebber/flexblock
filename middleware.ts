import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

function basicAuth(req: NextRequest) {
  const USER = process.env.ADMIN_USER;
  const PASS = process.env.ADMIN_PASS;

  // Lokal: wenn nicht gesetzt, nicht blocken
  if (!USER || !PASS) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Basic ")) {
    const encoded = auth.slice(6);
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const i = decoded.indexOf(":");
    const u = decoded.slice(0, i);
    const p = decoded.slice(i + 1);

    if (u === USER && p === PASS) return NextResponse.next();
  }

  const res = new NextResponse("Authentication required", { status: 401 });
  res.headers.set("WWW-Authenticate", 'Basic realm="Flexblock Admin"');
  return res;
}

// NextAuth nur für /dashboard
const dashboardAuth = withAuth({
  pages: { signIn: "/access" },
});

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

if (
  path.startsWith("/orders") ||
  path.startsWith("/color-admin") ||
  path.startsWith("/admin") ||
  path.startsWith("/api/updateColors")
) return basicAuth(req);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/color-admin/:path*",
    "/admin/:path*",
    "/api/updateColors",
  ],
};