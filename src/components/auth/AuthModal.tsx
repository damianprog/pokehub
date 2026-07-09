"use client";

import { useAuthModal } from "@/store/auth-modal";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  submitBtnClass,
  footerTextClass,
  footerLinkClass,
} from "@/components/auth/auth-form-styles";

function LogoMark() {
  return (
    <div className="flex items-center gap-[9px] mb-6">
      <div className="size-[26px] rounded-[8px] bg-gradient-to-br from-brand-from to-brand-to flex items-center justify-center text-white font-extrabold text-[13px] font-heading shrink-0">
        P
      </div>
      <span className="font-heading font-bold text-base tracking-[-0.015em]">
        PokeHub
      </span>
    </div>
  );
}

const modalInputClass = `${inputClass} ${inputBorderClass}`;
const modalSubmitBtnClass = `${submitBtnClass} mb-[18px]`;
const modalFooterLinkClass = `${footerLinkClass} bg-transparent border-0 p-0 text-[inherit] cursor-pointer`;

function LoginView({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div>
      <h2 className="mt-0 mb-[6px] font-heading font-bold text-2xl tracking-[-0.02em]">
        Welcome back
      </h2>
      <p className="mt-0 mb-[26px] text-dim-foreground text-[14.5px]">
        Log in to your PokeHub account.
      </p>

      <div className="mb-[14px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Username or email</div>
        <input type="text" placeholder="trainer@pokehub.gg" className={modalInputClass} />
      </div>

      <div className="mb-[22px]">
        <div className="flex justify-between items-baseline mb-[7px]">
          <span className={fieldLabelClass}>Password</span>
          <span className="text-xs text-brand-to cursor-pointer">Forgot?</span>
        </div>
        <input type="password" placeholder="••••••••" className={modalInputClass} />
      </div>

      <button className={modalSubmitBtnClass}>Log in</button>

      <div className={footerTextClass}>
        No account?{" "}
        <button className={modalFooterLinkClass} onClick={onSwitch}>
          Sign up free
        </button>
      </div>
    </div>
  );
}

function SignupView({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div>
      <h2 className="mt-0 mb-[6px] font-heading font-bold text-2xl tracking-[-0.02em]">
        Join PokeHub
      </h2>
      <p className="mt-0 mb-[26px] text-dim-foreground text-[14.5px]">
        Free forever. No Pokémon expertise required.
      </p>

      <div className="mb-[14px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Username</div>
        <input type="text" placeholder="ash_ketchum" className={modalInputClass} />
      </div>

      <div className="mb-[14px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Email</div>
        <input type="email" placeholder="you@example.com" className={modalInputClass} />
      </div>

      <div className="mb-[22px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Password</div>
        <input type="password" placeholder="••••••••" className={modalInputClass} />
      </div>

      <button className={modalSubmitBtnClass}>Create account</button>

      <div className={footerTextClass}>
        Already a trainer?{" "}
        <button className={modalFooterLinkClass} onClick={onSwitch}>
          Log in
        </button>
      </div>
    </div>
  );
}

export function AuthModal() {
  const { mode, open, close } = useAuthModal();

  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.72)] z-[200] flex items-center justify-center"
      onClick={close}
    >
      <div
        className="bg-card border border-[rgba(255,255,255,0.1)] rounded-[20px] p-9 w-[420px] max-w-[92vw] relative animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 size-8 rounded-[8px] border-0 bg-[rgba(255,255,255,0.06)] text-[#8b919e] text-lg flex items-center justify-center leading-none"
        >
          ×
        </button>

        <LogoMark />

        {mode === "login" ? (
          <LoginView onSwitch={() => open("signup")} />
        ) : (
          <SignupView onSwitch={() => open("login")} />
        )}
      </div>
    </div>
  );
}
