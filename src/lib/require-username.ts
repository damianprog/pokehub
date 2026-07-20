import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

type RequireUsernameResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

/**
 * Guard for mutation routes: the redirect gate in proxy.ts is navigation UX only,
 * so any route creating user-visible content must independently confirm the
 * signed-in user has a username before writing rows tied to their profile.
 */
export async function requireUsername(): Promise<RequireUsernameResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!session.user.username) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Choose a username before doing that." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, session };
}
