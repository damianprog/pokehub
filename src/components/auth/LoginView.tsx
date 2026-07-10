"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

const modalFooterLinkClass = `${footerLinkClass} bg-transparent border-0 p-0 text-[inherit] cursor-pointer`;

export function LoginView({
  onSwitch,
  onSuccess,
}: {
  onSwitch: () => void;
  onSuccess: () => void;
}) {
  return (
    <div>
      <h2 className="mt-0 mb-[6px] font-heading font-bold text-2xl tracking-[-0.02em]">
        Welcome back
      </h2>
      <p className="mt-0 mb-[26px] text-dim-foreground text-[14.5px]">
        Log in to your PokeHub account.
      </p>

      <LoginForm onSuccess={onSuccess} />

      <div className={footerTextClass}>
        No account?{" "}
        <button className={modalFooterLinkClass} onClick={onSwitch}>
          Sign up free
        </button>
      </div>
    </div>
  );
}
