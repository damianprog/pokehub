import Link from "next/link";
import { NavAuthButtons } from "@/components/auth/NavAuthButtons";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-2 px-4 sm:gap-[22px] sm:px-[26px]">
        <Link href="/" className="flex items-center gap-[11px]">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] font-heading text-[15px] font-extrabold text-white shadow-[0_4px_14px_rgba(196,79,224,0.4)]">
            P
          </span>
          <span className="font-heading text-[19px] font-bold tracking-tight whitespace-nowrap text-foreground">
            PokeHub
          </span>
        </Link>

        <div className="flex-1" />

        <Link
          href="/discover"
          className="hidden px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Browse Pokedex
        </Link>

        <NavAuthButtons />
      </div>
    </header>
  );
}
