import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isProtected =
    req.nextUrl.pathname.startsWith("/settings") ||
    req.nextUrl.pathname.startsWith("/packs");

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/settings/:path*", "/packs/:path*"],
};
