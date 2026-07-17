import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password — PokeHub",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <div className="w-[420px] max-w-full animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
            Reset your password
          </h1>
          <p className="m-0 text-dim-foreground text-[15px]">
            Choose a new password for your account.
          </p>
        </div>

        <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
