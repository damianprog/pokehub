"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { postReview } from "@/actions/rating";
import { formatRatingValue, toWordLabel } from "@/lib/rating";
import { runAction } from "@/lib/run-action";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { RatingStars } from "@/components/pokemon/RatingStars";
import { ReviewComposerMobile } from "@/components/pokemon/ReviewComposerMobile";
import { ReviewComposerDesktop } from "@/components/pokemon/ReviewComposerDesktop";

const REVIEW_MAX_LENGTH = 1000;
const REVIEW_MIN_LENGTH = 6;

interface ReviewComposerFormProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  primaryType: string;
  artworkUrl: string;
  initialRating: number | null;
  initialReviewText: string | null;
  username: string;
  onClose: () => void;
}

/**
 * Owns the composer's state and the submit/cancel handlers, shared between
 * the two presentational shells (`ReviewComposerMobile`, the full-screen
 * sheet; `ReviewComposerDesktop`, the centered modal) — their markup diverges
 * enough (different chrome, layout order) that splitting them into separate
 * files reads better than one component branching internally on `md:`.
 */
export function ReviewComposerForm({
  pokemonId,
  slug,
  pokemonName,
  primaryType,
  artworkUrl,
  initialRating,
  initialReviewText,
  username,
  onClose,
}: ReviewComposerFormProps) {
  const router = useRouter();
  const [committedValue, setCommittedValue] = useState(initialRating ?? 0);
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState(initialReviewText ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayValue = previewValue ?? committedValue;
  const isDimmed = previewValue !== null;
  const trimmedReviewLength = reviewText.trim().length;
  const reviewTooShort = trimmedReviewLength < REVIEW_MIN_LENGTH;
  const canSubmit = committedValue > 0 && !reviewTooShort && !isSubmitting;
  const dexNumber = `#${String(pokemonId).padStart(3, "0")}`;
  const gradient = TYPE_GRADIENTS[primaryType.toLowerCase()]?.bg ?? FALLBACK_GRADIENT.bg;
  const ariaLabel = `Rate ${pokemonName}`;
  const ariaValueText =
    displayValue > 0 ? `${formatRatingValue(displayValue)} out of 5 stars` : "Not yet rated";

  function handleCommit(value: number) {
    setCommittedValue(value);
    setPreviewValue(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const result = await runAction(
      postReview({
        pokemonId,
        slug,
        rating: committedValue,
        reviewText: reviewText.trim(),
      }),
    );
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Review posted.");
    onClose();
    router.refresh();
  }

  const ratingCaption =
    displayValue > 0 ? (
      <span className="font-heading text-[13px] font-bold text-[#e6b450]">
        {formatRatingValue(displayValue)} · {toWordLabel(displayValue)}
      </span>
    ) : (
      <span className="text-[13px] text-[#7b818c]">Tap a star to rate — halves allowed</span>
    );

  const starControl = (
    <RatingStars
      value={displayValue}
      pointerInteractive
      dimmed={isDimmed}
      ariaLabel={ariaLabel}
      ariaValueText={ariaValueText}
      onHoverChange={setPreviewValue}
      onCommit={handleCommit}
    />
  );

  const textField = (
    <div className="flex flex-col gap-[8px]">
      <div
        className={`rounded-[13px] border bg-[#0f1216] p-[14px_15px] ${
          reviewText
            ? "border-[rgba(196,79,224,0.35)] shadow-[0_0_0_3px_rgba(196,79,224,0.1)]"
            : "border-white/[0.08]"
        }`}
      >
        <textarea
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value.slice(0, REVIEW_MAX_LENGTH))}
          maxLength={REVIEW_MAX_LENGTH}
          placeholder={`What makes ${pokemonName} land for you? Design, competitive use, nostalgia — say the honest thing.`}
          className="h-[118px] w-full resize-none border-0 bg-transparent text-[14.5px] leading-[1.6] text-[#e8eaed] placeholder:text-[#5c636e]"
        />
      </div>
      <div className="flex justify-between text-[12px] text-[#5c636e]">
        <span>
          {reviewTooShort
            ? `Write at least ${REVIEW_MIN_LENGTH} characters to post`
            : "Markdown-lite: *italic*, **bold**"}
        </span>
        <span className={reviewText.length > 0 ? "text-[#9aa0ab]" : ""}>
          {reviewText.length.toLocaleString()} / {REVIEW_MAX_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  );

  const pickARatingHint = !canSubmit && !isSubmitting && !reviewTooShort && (
    <div className="text-right text-[12px] text-[#7b818c]">Pick a rating to post</div>
  );

  const sharedProps = {
    pokemonName,
    dexNumber,
    artworkUrl,
    gradient,
    starControl,
    ratingCaption,
    textField,
    pickARatingHint,
    canSubmit,
    onClose,
    onSubmit: handleSubmit,
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(0,0,0,0.72)] md:p-0"
      onClick={onClose}
    >
      <ReviewComposerMobile {...sharedProps} />
      <ReviewComposerDesktop {...sharedProps} username={username} />
    </div>
  );
}
