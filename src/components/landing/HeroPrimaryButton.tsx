"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/store/auth-modal";
import { Button } from "@/components/ui/button";

const PRIMARY_CLASS =
  "h-[50px] rounded-[13px] border-0 bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[30px] text-base font-bold text-brand-ink shadow-[0_8px_26px_rgba(63,217,138,0.38)] hover:brightness-110";

/**
 * The hero's primary CTA — opens the sign-up modal for visitors (same as the nav's
 * "Sign up free"), or links a signed-in user to their own profile.
 */
export function HeroPrimaryButton() {
  const { data: session } = useSession();
  const { open } = useAuthModal();

  if (session) {
    return (
      <Button
        render={<Link href={`/u/${session.user.username}`} />}
        nativeButton={false}
        size="lg"
        className={PRIMARY_CLASS}
      >
        Your profile
      </Button>
    );
  }

  return (
    <Button size="lg" className={PRIMARY_CLASS} onClick={() => open("signup")}>
      Start for free
    </Button>
  );
}
