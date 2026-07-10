"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignupForm, type SignupPhase } from "@/components/auth/SignupForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

export function RegisterForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<SignupPhase>("form");

  return (
    <div className="w-[440px] max-w-full animate-fade-up">
      {phase === "form" && (
        <div className="text-center mb-8">
          <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
            Join PokeHub
          </h1>
          <p className="m-0 text-dim-foreground text-[15px]">
            Free forever. Rate, collect, obsess.
          </p>
        </div>
      )}

      <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
        <SignupForm
          onPhaseChange={setPhase}
          onSignedIn={() => {
            router.push("/");
            router.refresh();
          }}
          onManualFallback={() => {
            router.push("/sign-in");
            router.refresh();
          }}
        />
      </div>

      {phase === "form" && (
        <div className={`${footerTextClass} mt-[22px]`}>
          Already a trainer?{" "}
          <Link href="/sign-in" className={footerLinkClass}>
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
