"use client";

import { useAuthModal } from "@/store/auth-modal";
import { Button } from "@/components/ui/button";

export function NavAuthButtons() {
  const { open } = useAuthModal();

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="rounded-[9px] px-3 text-sm font-semibold whitespace-nowrap sm:px-[17px]"
        onClick={() => open("login")}
      >
        Log in
      </Button>
      <Button
        size="lg"
        className="rounded-[9px] border-0 bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-3 text-sm font-bold whitespace-nowrap text-white shadow-[0_4px_14px_rgba(196,79,224,0.32)] hover:brightness-110 sm:px-[17px]"
        onClick={() => open("signup")}
      >
        Sign up free
      </Button>
    </>
  );
}
