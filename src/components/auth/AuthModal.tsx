"use client";

import { useRouter } from "next/navigation";
import { useAuthModal } from "@/store/auth-modal";
import { LogoMark } from "@/components/auth/LogoMark";
import { LoginView } from "@/components/auth/LoginView";
import { SignupView } from "@/components/auth/SignupView";

export function AuthModal() {
  const router = useRouter();
  const { mode, open, close } = useAuthModal();

  if (!mode) return null;

  function handleAuthSuccess() {
    close();
    router.push("/");
    router.refresh();
  }

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
          <LoginView onSwitch={() => open("signup")} onSuccess={handleAuthSuccess} />
        ) : (
          <SignupView onSwitch={() => open("login")} onDone={() => open("login")} />
        )}
      </div>
    </div>
  );
}
