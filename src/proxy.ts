import { NextResponse } from "next/server";
import { auth } from "@/auth";

const USERNAME_PAGE = "/signup/username";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/settings") || pathname.startsWith("/packs");

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  if (req.auth && !req.auth.user.username && pathname !== USERNAME_PAGE) {
    return NextResponse.redirect(new URL(USERNAME_PAGE, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
