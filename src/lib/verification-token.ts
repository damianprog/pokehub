import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createVerificationToken(email: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  return token;
}

export type VerificationResult =
  | { status: "valid"; email: string }
  | { status: "invalid" }
  | { status: "expired" };

export async function consumeVerificationToken(token: string): Promise<VerificationResult> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return { status: "invalid" };

  await prisma.verificationToken.delete({ where: { token } });

  if (record.expires < new Date()) return { status: "expired" };

  return { status: "valid", email: record.identifier };
}
