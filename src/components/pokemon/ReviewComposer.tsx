"use client";

import { useReviewComposer } from "@/store/review-composer";
import { ReviewComposerForm } from "@/components/pokemon/ReviewComposerForm";

interface ReviewComposerProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  primaryType: string;
  artworkUrl: string;
  /** The signed-in user's current rating, in half-star units, or null if unset. */
  initialRating: number | null;
  initialReviewText: string | null;
  username: string;
}

/**
 * Store-gated shell around `ReviewComposerForm`. The form only mounts while
 * `isOpen` is true, so each open starts a fresh instance seeded from the
 * current `initialRating`/`initialReviewText` props — closing (Cancel, the
 * backdrop, or a successful post) unmounts it, which is what discards any
 * unsaved draft rather than a reset ever needing to be coded explicitly.
 */
export function ReviewComposer(props: ReviewComposerProps) {
  const { isOpen, close } = useReviewComposer();

  if (!isOpen) return null;

  return <ReviewComposerForm {...props} onClose={close} />;
}
