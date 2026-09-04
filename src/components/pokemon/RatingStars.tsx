"use client";

import { useRef } from "react";
import { RATING_MAX, RATING_MIN, STAR_COUNT, toStarFillFractions } from "@/lib/rating";

interface RatingStarsProps {
  /** Half-star units to render as filled. 0 renders a completely flat row. */
  value: number;
  /** Gates hover-preview and click-to-commit. Keyboard stays operable regardless — see handleKeyDown. */
  pointerInteractive: boolean;
  /** Provisional (hover/edit-preview) fill renders at reduced opacity so it never reads as committed. */
  dimmed: boolean;
  ariaLabel: string;
  ariaValueText: string;
  onHoverChange: (value: number | null) => void;
  onCommit: (value: number) => void;
}

export function RatingStars({
  value,
  pointerInteractive,
  dimmed,
  ariaLabel,
  ariaValueText,
  onHoverChange,
  onCommit,
}: RatingStarsProps) {
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Measures against each star's own rect rather than dividing the row's total
  // width by 10 — the row includes inter-star `gap`s but no trailing one, so a
  // linear division of the whole width doesn't land on the same star centers
  // the fill rendering below uses (see toStarFillFractions).
  function segmentFromPointer(clientX: number): number {
    const rects = starRefs.current.map((el) => el?.getBoundingClientRect());
    const starIndex = rects.findIndex((rect) => rect && clientX < rect.right);
    const index = starIndex === -1 ? STAR_COUNT - 1 : starIndex;
    const rect = rects[index];
    if (!rect || rect.width === 0) return RATING_MIN;

    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const half = fraction < 0.5 ? 1 : 2;
    const segment = index * 2 + half;
    return Math.min(RATING_MAX, Math.max(RATING_MIN, segment));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    if (!pointerInteractive) return;
    onHoverChange(segmentFromPointer(event.clientX));
  }

  function handlePointerLeave() {
    if (!pointerInteractive) return;
    onHoverChange(null);
  }

  function handleClick(event: React.MouseEvent<HTMLSpanElement>) {
    if (!pointerInteractive) return;
    onCommit(segmentFromPointer(event.clientX));
  }

  // Arrow keys always work, even when the row is showing its "rated" (non-editing)
  // display — a keyboard user shouldn't need to click "Edit" first just to nudge
  // the value, since the accidental-overwrite risk that click-gating guards against
  // is a pointer-specific hazard, not a keyboard one.
  function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onCommit(Math.min(RATING_MAX, Math.max(RATING_MIN, value + 1)));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onCommit(Math.min(RATING_MAX, Math.max(RATING_MIN, value - 1)));
    }
  }

  const fillFractions = toStarFillFractions(value);

  return (
    <span
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={RATING_MIN}
      aria-valuemax={RATING_MAX}
      aria-valuenow={value || undefined}
      aria-valuetext={ariaValueText}
      tabIndex={0}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center gap-[8px] ${pointerInteractive ? "cursor-pointer" : ""} text-[30px] leading-none select-none md:gap-[5px] md:text-[24px]`}
      style={{ fontFamily: "Arial" }}
    >
      {fillFractions.map((fraction, index) => (
        // Each star clips against its own natural glyph width, not the row's —
        // see toStarFillFractions for why that's what keeps a half-star fill
        // centered on the glyph instead of skewed by row-wide letter-spacing.
        <span
          key={index}
          ref={(el) => {
            starRefs.current[index] = el;
          }}
          className="relative inline-block"
        >
          <span style={{ color: "#4a4f5a" }}>★</span>
          {fraction > 0 && (
            <span
              className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
              style={{ color: "#e6b450", width: `${fraction * 100}%`, opacity: dimmed ? 0.62 : 1 }}
            >
              ★
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
