import { z } from "zod";

// `UserPokemon.rating` is stored as an integer in half-star units: 1-10, where
// 1 = 0.5 star and 10 = 5.0 stars (see prisma/schema.prisma). This module owns
// that unit — nothing outside it should multiply or divide by two inline.

export const RATING_MIN = 1; // 0.5 stars
export const RATING_MAX = 10; // 5.0 stars
export const STAR_COUNT = 5;

export const ratingValueSchema = z.number().int().min(RATING_MIN).max(RATING_MAX);
export const nullableRatingValueSchema = ratingValueSchema.nullable();

/** Half-star units -> star count, e.g. 9 -> 4.5. */
export function toStars(halfUnits: number): number {
  return halfUnits / 2;
}

/** Star count -> half-star units, rounded to the nearest half, e.g. 4.5 -> 9. */
export function toHalfUnits(stars: number): number {
  return Math.round(stars * 2);
}

/** Half-star units -> fill percentage for the two-layer partial-fill star renderers. */
export function toFillPercent(halfUnits: number): number {
  return (halfUnits / RATING_MAX) * 100;
}

const HALF_UNITS_PER_STAR = RATING_MAX / STAR_COUNT;

/**
 * Half-star units -> a fill fraction (0, 0.5, or 1) per star, left to right.
 * Fill percentage must be computed per-star rather than once across the whole
 * row: a single width% clip over all 5 glyphs clips at a fraction of the
 * *row's* rendered width, which — thanks to letter-spacing and per-glyph
 * kerning — doesn't land on any individual star's true horizontal center.
 * Clipping each star against its own natural width does.
 */
export function toStarFillFractions(halfUnits: number): number[] {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const filledHalfUnits = halfUnits - index * HALF_UNITS_PER_STAR;
    return Math.min(1, Math.max(0, filledHalfUnits / HALF_UNITS_PER_STAR));
  });
}

const RATING_WORD_LABELS = ["Awful", "Weak", "Fine", "Great", "Peak"] as const;

/** One-word label for a half-star-unit value — halves reuse the label of the whole star they sit under. */
export function toWordLabel(halfUnits: number): string {
  const starIndex = Math.ceil(toStars(halfUnits)); // 1-5
  return RATING_WORD_LABELS[starIndex - 1];
}

/** Display string for a half-star-unit value: whole values print bare ("4"), halves print one decimal ("4.5"). */
export function formatRatingValue(halfUnits: number): string {
  const stars = toStars(halfUnits);
  return Number.isInteger(stars) ? String(stars) : stars.toFixed(1);
}
