"use client";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavAvatarMenuProps {
  letter: string;
}

export function NavAvatarMenu({ letter }: NavAvatarMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-[38px] items-center justify-center rounded-full border-2 border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#6a5acd,var(--brand-to))] font-heading text-sm font-extrabold text-white"
      >
        {letter}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
