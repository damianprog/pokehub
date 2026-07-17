import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { submitBtnClass } from "@/components/auth/auth-form-styles";

export const metadata: Metadata = {
  title: "Verify your email — PokeHub",
};

const content = {
  success: {
    heading: "Email verified!",
    body: "Your email is confirmed. You can now log in.",
  },
  expired: {
    heading: "Link expired",
    body: "This verification link has expired. Request a new one below.",
  },
  invalid: {
    heading: "Invalid link",
    body: "This verification link is invalid or has already been used. Request a new one below.",
  },
} as const;

type Status = keyof typeof content;

function isStatus(value: string | undefined): value is Status {
  return value === "success" || value === "expired" || value === "invalid";
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status: rawStatus } = await searchParams;
  const status: Status = isStatus(rawStatus) ? rawStatus : "invalid";
  const { heading, body } = content[status];

  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <div className="w-[420px] max-w-full animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
            {heading}
          </h1>
          <p className="m-0 text-dim-foreground text-[15px]">{body}</p>
        </div>

        <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
          {status === "success" ? (
            <Link href="/sign-in" className={`${submitBtnClass} flex items-center justify-center`}>
              Log in
            </Link>
          ) : (
            <ResendVerificationForm />
          )}
        </div>
      </div>
    </div>
  );
}
