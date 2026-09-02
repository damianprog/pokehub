"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavAvatarMenuProps {
  letter: string;
  image?: string | null;
  username: string | null;
}

export function NavAvatarMenu({ letter, image, username }: NavAvatarMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-[38px] items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#6a5acd,var(--brand-to))] font-heading text-sm font-extrabold text-white">
        {image ? (
          <Image
            src={image}
            alt=""
            width={38}
            height={38}
            className="size-full object-cover"
          />
        ) : (
          letter
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {username && (
          <>
            <DropdownMenuItem onClick={() => router.push(`/u/${username}`)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
