"use client";

import { SignupForm } from "@/components/auth/SignupForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

const modalFooterLinkClass = `${footerLinkClass} bg-transparent border-0 p-0 text-[inherit] cursor-pointer`;

export function SignupView({
  onSwitch,
  onRegistered,
}: {
  onSwitch: () => void;
  onRegistered: () => void;
}) {
  return (
    <div>
      <h2 className="mt-0 mb-[6px] font-heading font-bold text-2xl tracking-[-0.02em]">
        Join PokeHub
      </h2>
      <p className="mt-0 mb-[26px] text-dim-foreground text-[14.5px]">
        Free forever. No Pokémon expertise required.
      </p>

      <SignupForm onRegistered={onRegistered} />

      <div className={footerTextClass}>
        Already a trainer?{" "}
        <button className={modalFooterLinkClass} onClick={onSwitch}>
          Log in
        </button>
      </div>
    </div>
  );
}
