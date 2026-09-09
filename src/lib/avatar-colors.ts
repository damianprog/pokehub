// A small fixed set of avatar gradients, in the same purple/magenta family
// already used elsewhere for gradient letter-badge avatars (nav avatar menu,
// `YourReview`). Nothing in the schema stores a per-user color, so a reviewer
// without a profile image gets one of these picked deterministically from
// their username — see
// rating-review/rating-05-top-reviews-real-aggregation-spec.md §7.

export interface AvatarGradient {
  from: string;
  to: string;
}

const AVATAR_GRADIENTS: AvatarGradient[] = [
  { from: "#6a5acd", to: "#c44fe0" },
  { from: "#8b6fd4", to: "#4a3a8a" },
  { from: "#e85b9e", to: "#b89ee0" },
  { from: "#ff7a45", to: "#c44fe0" },
  { from: "#4a90d9", to: "#6a5acd" },
];

/** Deterministic pick from `AVATAR_GRADIENTS` so different users render distinct badge colors. */
export function pickAvatarGradient(seed: string): AvatarGradient {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}
