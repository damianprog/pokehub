import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const RESERVED_USERNAMES = new Set([
  "sign-in",
  "register",
  "settings",
  "packs",
  "discover",
  "search",
  "api",
  "p",
  "u",
  "list",
  "review",
]);

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters.")
  .max(20, "Use at most 20 characters.")
  .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, underscores and hyphens.")
  .refine((value) => !RESERVED_USERNAMES.has(value), "That username isn't available.");

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.username) {
    return NextResponse.json(
      { success: false, error: "Username already set" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = usernameSchema.safeParse((body as { username?: unknown })?.username);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid username" },
      { status: 400 },
    );
  }

  const username = parsed.data;

  try {
    const result = await prisma.user.updateMany({
      where: { id: session.user.id, username: null },
      data: { username },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: "Username already set" },
        { status: 400 },
      );
    }
  } catch (err) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "That username is already taken." },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ success: true, username });
}
