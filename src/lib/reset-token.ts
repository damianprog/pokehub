import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000;

// Prefixed so a password-reset request can't delete/collide with a pending
// email-verification token for the same address (both use VerificationToken
// keyed by identifier = email).
function resetIdentifier(email: string): string {
  return `reset:${email}`;
}

export async function createResetToken(email: string): Promise<string> {
  const identifier = resetIdentifier(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  return token;
}

export type ResetTokenResult =
  | { status: "valid"; email: string }
  | { status: "invalid" }
  | { status: "expired" };

export async function consumeResetToken(token: string): Promise<ResetTokenResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.identifier.startsWith("reset:")) return { status: "invalid" };

  await prisma.verificationToken.delete({ where: { token } });

  if (record.expires < new Date()) return { status: "expired" };

  return { status: "valid", email: record.identifier.slice("reset:".length) };
}
