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
    // A server action is a POST to the page's own URL carrying a `Next-Action`
    // header, so it hits this gate too. Answering it with a redirect would make
    // the action client choke on the HTML it gets back; answer it like a failed
    // action instead. This is the only username check on the mutation path —
    // actions themselves only verify the session exists (see auth-04 spec §2).
    if (req.headers.has("next-action")) {
      return NextResponse.json(
        { success: false, error: "Choose a username first." },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL(USERNAME_PAGE, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
