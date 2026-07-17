import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

export const metadata: Metadata = {
  title: "Reset your password — PokeHub",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <div className="w-[420px] max-w-full animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
            Forgot password?
          </h1>
          <p className="m-0 text-dim-foreground text-[15px]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
          <ForgotPasswordForm />
        </div>

        <div className={`${footerTextClass} mt-[22px]`}>
          Remembered it?{" "}
          <Link href="/sign-in" className={footerLinkClass}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
