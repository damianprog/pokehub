"use client";

import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { footerTextClass, footerLinkClass } from "@/components/auth/auth-form-styles";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

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
      <Image
        src={`${SPRITE_BASE}/25.png`}
        alt=""
        width={100}
        height={100}
        className="pointer-events-none absolute top-[-62px] right-[58px] size-[100px] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
      />
      <h2 className="mt-0 mb-[6px] font-heading font-bold text-2xl tracking-[-0.02em]">
        Welcome back
      </h2>
      <p className="mt-0 mb-[26px] text-dim-foreground text-[14.5px]">
        Log in to your PokeHub account.
      </p>

      <LoginForm onSuccess={onSuccess} />

      <div className={`${footerTextClass} mt-[22px]`}>
        No account?{" "}
        <button className={modalFooterLinkClass} onClick={onSwitch}>
          Sign up free
        </button>
      </div>
    </div>
  );
}
