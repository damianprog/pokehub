"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

const oauthErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const initialError = errorParam
    ? (oauthErrorMessages[errorParam] ?? "Something went wrong signing you in. Please try again.")
    : undefined;

  return (
    <div className="w-[420px] max-w-full animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
          Welcome back
        </h1>
        <p className="m-0 text-dim-foreground text-[15px]">
          Log in to keep rating &amp; collecting.
        </p>
      </div>

      <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
        <LoginForm
          initialError={initialError}
          onSuccess={() => {
            router.push("/");
            router.refresh();
          }}
        />
      </div>

      <div className={`${footerTextClass} mt-[22px]`}>
        No account?{" "}
        <Link href="/register" className={footerLinkClass}>
          Sign up free
        </Link>
      </div>
    </div>
  );
}
