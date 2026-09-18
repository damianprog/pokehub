"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NavAuthButtons } from "@/components/auth/NavAuthButtons";
import { SignedInNav } from "@/components/landing/SignedInNav";

export function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const hasMobileChrome = pathname.startsWith("/p/");

  return (
    <header
      className={`${hasMobileChrome ? "hidden md:block " : ""}sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-lg`}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-2 px-4 sm:gap-[22px] sm:px-[26px]">
        <Link href="/" className="flex items-center gap-[11px]">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] font-heading text-[15px] font-extrabold text-white shadow-[0_4px_14px_rgba(196,79,224,0.4)]">
            P
          </span>
          <span className="font-heading text-[19px] font-bold tracking-tight whitespace-nowrap text-foreground">
            PokeHub
          </span>
        </Link>

        {session?.user?.username ? (
          <SignedInNav user={session.user} />
        ) : session ? (
          // Signed in but still on /signup/username — the one page proxy.ts
          // exempts from the username gate, so the only place this session can
          // have `username === null` (see the Session type in next-auth.d.ts).
          // SignedInNav assumes a username; all this user needs is a way out.
          <>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="lg"
              className="rounded-[9px] px-3 text-sm font-semibold whitespace-nowrap sm:px-[17px]"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1" />

            <Link
              href="/discover"
              className="hidden px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Browse Pokedex
            </Link>

            <NavAuthButtons />
          </>
        )}
      </div>
    </header>
  );
}
