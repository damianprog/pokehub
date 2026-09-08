"use client";

import { useState } from "react";
import { useReviewComposer } from "@/store/review-composer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteReviewDialog } from "@/components/pokemon/DeleteReviewDialog";

interface YourReviewMenuProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  rating: number | null;
}

/**
 * The "⋯" overflow trigger on the "Your review" card. Only Edit review and
 * Delete ship — the design's third item, Share, is dropped rather than
 * shipped inert, since there's no share feature to back it (see
 * rating-review/rating-04-your-review-block-spec.md §4).
 */
export function YourReviewMenu({ pokemonId, slug, pokemonName, rating }: YourReviewMenuProps) {
  const { open: openComposer } = useReviewComposer();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Review options"
          className="flex size-[28px] flex-none items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.07] text-[14px] text-[#9aa0ab]"
        >
          ⋯
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={openComposer}>Edit review</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setIsConfirmOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isConfirmOpen && (
        <DeleteReviewDialog
          pokemonId={pokemonId}
          slug={slug}
          pokemonName={pokemonName}
          rating={rating}
          onClose={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
}
