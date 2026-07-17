import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/verification-email";

const resendSchema = z.object({ email: z.string().email() });

const genericResponse = {
  success: true,
  message: "If that account needs verification, we've sent a new link.",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    try {
      const token = await createVerificationToken(email);
      const origin = new URL(request.url).origin;
      await sendVerificationEmail({
        to: email,
        name: user.name,
        verifyUrl: `${origin}/api/auth/verify-email?token=${token}`,
      });
    } catch (err) {
      console.error("Failed to send verification email", err);
    }
  }

  return NextResponse.json(genericResponse);
}
