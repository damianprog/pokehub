import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verification-token";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?status=invalid", url.origin),
    );
  }

  const result = await consumeVerificationToken(token);

  if (result.status !== "valid") {
    return NextResponse.redirect(
      new URL(`/verify-email?status=${result.status}`, url.origin),
    );
  }

  try {
    await prisma.user.update({
      where: { email: result.email },
      data: { emailVerified: new Date() },
    });
  } catch {
    return NextResponse.redirect(
      new URL("/verify-email?status=invalid", url.origin),
    );
  }

  return NextResponse.redirect(
    new URL("/verify-email?status=success", url.origin),
  );
}
