"use client";

import { useAuthModal } from "@/store/auth-modal";
import { Button } from "@/components/ui/button";

/** The hero's primary CTA — opens the sign-up modal, same as the nav's "Sign up free". */
export function HeroSignupButton() {
  const { open } = useAuthModal();

  return (
    <Button
      size="lg"
      className="h-[50px] rounded-[13px] border-0 bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[30px] text-base font-bold text-white shadow-[0_8px_26px_rgba(196,79,224,0.38)] hover:brightness-110"
      onClick={() => open("signup")}
    >
      Start for free
    </Button>
  );
}
