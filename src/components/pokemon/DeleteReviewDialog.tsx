"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteReview } from "@/actions/rating";
import { formatRatingValue } from "@/lib/rating";
import { runAction } from "@/lib/run-action";

interface DeleteReviewDialogProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  rating: number | null;
  onClose: () => void;
}

/**
 * Confirmation dialog for deleting the written review from the "Your review"
 * card. Only clears `reviewText` — the rating is unaffected, which the body
 * copy calls out explicitly since that's the whole reason this is a
 * confirmation step and not an immediate action.
 */
export function DeleteReviewDialog({
  pokemonId,
  slug,
  pokemonName,
  rating,
  onClose,
}: DeleteReviewDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await runAction(deleteReview({ pokemonId, slug }));
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Review deleted.");
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={`Delete your ${pokemonName} review?`}
        className="w-full max-w-[440px] rounded-[18px] border border-white/10 bg-card p-[24px] shadow-[0_30px_70px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-[16px] flex size-[42px] items-center justify-center rounded-[12px] border border-[rgba(224,112,92,0.28)] bg-[rgba(224,112,92,0.14)] text-[18px]">
          🗑
        </div>
        <h3 className="font-heading mb-[8px] text-[20px] font-bold tracking-[-0.01em]">
          Delete your {pokemonName} review?
        </h3>
        <p className="mb-[20px] text-[14px] leading-[1.6] text-[#9aa0ab]">
          {rating !== null
            ? `Your ${formatRatingValue(rating)}★ rating stays on the Pokémon — only the written review is removed.`
            : "Only the written review is removed."}{" "}
          This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] rounded-[11px] border border-white/10 bg-white/[0.06] px-[18px] text-[14px] font-bold text-[#cdd2da]"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-[40px] rounded-[11px] bg-[#b8503c] px-[18px] text-[14px] font-bold text-white disabled:opacity-60"
          >
            Delete review
          </button>
        </div>
      </div>
    </div>
  );
}
