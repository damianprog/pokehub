"use client";

import { useAuthModal } from "@/store/auth-modal";
import { useReviewComposer } from "@/store/review-composer";

interface WriteReviewButtonProps {
  isAuthenticated: boolean;
  className?: string;
}

/**
 * Opens the same review composer every "Write review" entry point across the
 * app opens — anonymous visitors get the auth modal instead. The single
 * source of truth for that behavior, reused by `PokemonActions` (desktop
 * sidebar), `PokemonMobileActionBar` (mobile sticky bar),
 * `TopReviewsEmptyState`, and `PokemonReviewsHeader`/the reviews page's
 * mobile button — each of which previously carried its own identical copy of
 * this handler.
 *
 * Only the gradient background, text color, and font are shared here —
 * every caller's size, border-radius, and shadow differ, so those are
 * entirely the caller's concern via `className` rather than baked in here,
 * which would otherwise fight a caller's own radius/shadow classes in the
 * generated stylesheet's cascade order.
 */
export function WriteReviewButton({ isAuthenticated, className }: WriteReviewButtonProps) {
  const { open: openAuthModal } = useAuthModal();
  const { open: openComposer } = useReviewComposer();

  function handleClick() {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    openComposer();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] font-heading font-bold text-white${className ? ` ${className}` : ""}`}
    >
      Write review
    </button>
  );
}
