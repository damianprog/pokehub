import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeResetToken } from "@/lib/reset-token";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;
  const result = await consumeResetToken(token);

  if (result.status !== "valid") {
    return NextResponse.json({ success: false, error: result.status }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    await prisma.user.update({
      where: { email: result.email },
      data: { password: hashedPassword },
    });
  } catch {
    return NextResponse.json({ success: false, error: "invalid" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
