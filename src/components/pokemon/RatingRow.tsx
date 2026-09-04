"use client";

import { useState } from "react";
import { toast } from "sonner";
import { clearRating, setRating } from "@/actions/rating";
import { formatRatingValue } from "@/lib/rating";
import { useAuthModal } from "@/store/auth-modal";
import { RatingStars } from "@/components/pokemon/RatingStars";
import { RatingValueChip } from "@/components/pokemon/RatingValueChip";

interface RatingRowProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  /** The signed-in user's current rating, in half-star units, or null if unset/anonymous. */
  initialRating: number | null;
  rank: number;
  typeLabel: string;
  listCount: number;
  likeCount: number;
}

export function RatingRow({
  pokemonId,
  slug,
  pokemonName,
  isAuthenticated,
  initialRating,
  rank,
  typeLabel,
  listCount,
  likeCount,
}: RatingRowProps) {
  const { open } = useAuthModal();
  const [committedValue, setCommittedValue] = useState<number | null>(initialRating);
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(initialRating === null);

  const isRated = committedValue !== null && !isEditing;
  const displayValue = previewValue ?? (isEditing ? 0 : (committedValue ?? 0));
  const isDimmed = previewValue !== null;

  function handleHoverChange(value: number | null) {
    setPreviewValue(value);
  }

  async function commitRating(value: number) {
    if (!isAuthenticated) {
      open("login");
      return;
    }

    const previousValue = committedValue;
    const wasUnset = previousValue === null;
    setCommittedValue(value);
    setPreviewValue(null);
    setIsEditing(false);

    const result = await setRating({ pokemonId, slug, rating: value });
    if (!result.success) {
      setCommittedValue(previousValue);
      setIsEditing(wasUnset);
      toast.error(result.error);
    }
  }

  async function handleClear() {
    const previousValue = committedValue;
    setCommittedValue(null);
    setPreviewValue(null);
    setIsEditing(true);

    const result = await clearRating({ pokemonId, slug });
    if (!result.success) {
      setCommittedValue(previousValue);
      setIsEditing(false);
      toast.error(result.error);
    }
  }

  function handleEdit() {
    setPreviewValue(committedValue);
    setIsEditing(true);
  }

  const label = isRated ? "Your rating" : "Rate it";
  const ariaLabel = `Rate ${pokemonName}`;
  const ariaValueText =
    displayValue > 0 ? `${formatRatingValue(displayValue)} out of 5 stars` : "Not yet rated";

  const cardStateClass = isRated
    ? "border-[rgba(230,180,80,0.2)]"
    : isDimmed
      ? "border-white/10 bg-[#15181e]"
      : "border-white/[0.06] bg-[#13161b]";

  return (
    <div
      className={`mb-[22px] rounded-[14px] border ${cardStateClass} px-[16px] py-[14px] leading-[normal] md:px-[20px] md:py-[16px] ${isRated ? "bg-[#15181e]" : ""}`}
    >
      {/* Mobile layout — label on its own line, stats below a rule */}
      <div className="flex flex-col gap-[12px] md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-semibold text-[#9aa0ab]">{label}</span>
          {isRated && (
            <div className="flex gap-[7px]">
              <button
                type="button"
                onClick={handleEdit}
                className="h-[30px] cursor-pointer rounded-[9px] border border-white/10 bg-white/[0.06] px-[12px] text-[12.5px] font-bold text-[#cdd2da]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="h-[30px] cursor-pointer rounded-[9px] px-[10px] text-[12.5px] font-semibold text-[#7b818c]"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-[11px]">
          <RatingStars
            value={displayValue}
            pointerInteractive={isEditing}
            dimmed={isDimmed}
            ariaLabel={ariaLabel}
            ariaValueText={ariaValueText}
            onHoverChange={handleHoverChange}
            onCommit={commitRating}
          />
          {isDimmed && <RatingValueChip value={displayValue} />}
          {isRated && (
            <span className="font-heading text-[16px] font-bold text-[#e6b450]">
              {formatRatingValue(displayValue)}
            </span>
          )}
        </div>
        <div className="flex gap-[24px] border-t border-white/[0.06] pt-[13px] text-[12px] text-[#7b818c]">
          <span>
            Ranked <span className="font-bold text-[#ff9a6b]">#{rank}</span> of {typeLabel}
          </span>
          <span>
            In <span className="font-bold text-[#e8eaed]">{listCount.toLocaleString()}</span> lists
          </span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden items-center gap-[14px] md:flex">
        <span className="text-[13px] font-semibold text-[#9aa0ab]">{label}</span>
        <RatingStars
          value={displayValue}
          pointerInteractive={isEditing}
          dimmed={isDimmed}
          ariaLabel={ariaLabel}
          ariaValueText={ariaValueText}
          onHoverChange={handleHoverChange}
          onCommit={commitRating}
        />
        {isDimmed && <RatingValueChip value={displayValue} />}
        {isRated && (
          <>
            <span className="font-heading text-[15px] font-bold text-[#e6b450]">
              {formatRatingValue(displayValue)}
            </span>
            <div className="flex items-center gap-[7px] pl-[4px]">
              <button
                type="button"
                onClick={handleEdit}
                className="h-[26px] cursor-pointer rounded-[8px] border border-white/10 bg-white/[0.06] px-[11px] text-[12px] font-bold text-[#cdd2da]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="h-[26px] cursor-pointer rounded-[8px] px-[11px] text-[12px] font-semibold text-[#7b818c]"
              >
                Clear
              </button>
            </div>
          </>
        )}
        <div className="flex-1" />
        <div className="flex gap-[24px] text-[12.5px] text-[#7b818c]">
          <span>
            Ranked <span className="font-bold text-[#ff9a6b]">#{rank}</span> of {typeLabel}
          </span>
          <span>
            In <span className="font-bold text-[#e8eaed]">{listCount.toLocaleString()}</span> lists
          </span>
          {!isRated && (
            <span>
              <span className="font-bold text-[#e8eaed]">{likeCount.toLocaleString()}</span> likes
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
