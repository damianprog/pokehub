import { formatRatingValue, toWordLabel } from "@/lib/rating";

interface RatingValueChipProps {
  /** Half-star units. */
  value: number;
}

/** The small "4 · Great" badge shown next to the stars while previewing a value (hover, keyboard focus, or edit-preview). */
export function RatingValueChip({ value }: RatingValueChipProps) {
  return (
    <span className="inline-flex h-[24px] items-center rounded-[7px] border border-[rgba(230,180,80,0.3)] bg-[rgba(230,180,80,0.14)] px-[10px] font-heading text-[12px] font-bold text-[#e6b450]">
      {formatRatingValue(value)} · {toWordLabel(value)}
    </span>
  );
}
