import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/reset-token";
import { sendResetPasswordEmail } from "@/lib/reset-password-email";

const forgotPasswordSchema = z.object({ email: z.string().email() });

const genericResponse = {
  success: true,
  message: "If that account exists, we've sent a password reset link.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Only credentials users (password set) can reset a password — OAuth-only
  // accounts have nothing to reset. Response stays generic either way so we
  // don't leak account existence.
  if (user && user.password) {
    try {
      const token = await createResetToken(email);
      const origin = new URL(request.url).origin;
      await sendResetPasswordEmail({
        to: email,
        name: user.name,
        resetUrl: `${origin}/reset-password?token=${token}`,
      });
    } catch (err) {
      console.error("Failed to send reset password email", err);
    }
  }

  return NextResponse.json(genericResponse);
}
