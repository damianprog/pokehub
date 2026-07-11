import Link from "next/link";
import { NavAvatarMenu } from "@/components/landing/NavAvatarMenu";

interface SignedInNavProps {
  user: {
    username: string | null;
    name?: string | null;
  };
}

export function SignedInNav({ user }: SignedInNavProps) {
  const letter = (user.username ?? user.name ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <nav className="ml-2 hidden items-center gap-1 md:flex">
        <Link
          href="/"
          className="rounded-[9px] px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-[rgba(255,255,255,0.06)]"
        >
          Feed
        </Link>
        <Link
          href="/"
          className="rounded-[9px] px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground"
        >
          Browse
        </Link>
        <Link
          href="/"
          className="rounded-[9px] px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-[rgba(255,255,255,0.06)] hover:text-foreground"
        >
          Packs
        </Link>
      </nav>

      <div className="flex-1" />

      <div className="hidden h-[38px] w-[230px] items-center gap-2 rounded-[11px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.05)] px-3 lg:flex">
        <span className="text-[15px] text-[#646b78]">⌕</span>
        <input
          placeholder="Search 1,302 Pokémon, lists, people…"
          className="w-full border-0 bg-transparent text-[13px] text-foreground outline-none"
        />
      </div>

      <div className="hidden h-[38px] items-center gap-[7px] rounded-[11px] border border-[rgba(110,170,255,0.22)] bg-[rgba(110,170,255,0.1)] px-[13px] md:flex">
        <span className="text-[13px] text-[#7fb6ff]">◆</span>
        <span className="font-heading text-[13px] font-bold text-[#bcd6ff]">2,450</span>
      </div>

      <NavAvatarMenu letter={letter} />
    </>
  );
}
