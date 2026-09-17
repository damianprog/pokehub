import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatRatingValue, toFillPercent } from "@/lib/rating";

const VARIANT_BORDER_CLASSES = {
  pinned: "border-[rgba(196,79,224,0.22)] shadow-[inset_3px_0_0_0_rgba(196,79,224,0.55)]",
  default: "border-white/[0.06]",
} as const;

const AVATAR_CLASSES =
  "flex size-[30px] flex-none items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#6a5acd,var(--brand-to))] text-[11px] font-extrabold text-white md:size-[34px] md:text-[12px]";

interface ReviewCardProps {
  username: string;
  /** `/u/[username]` for the reviewer, or null when it can't be resolved (e.g. no username set) — avatar/name render unlinked in that case. */
  profileHref?: string | null;
  avatarImage?: string | null;
  /** Half-star units, or null if the user cleared their rating but kept the written review. */
  rating: number | null;
  reviewText: string;
  reviewedAt: Date;
  /** "pinned" is `YourReview`'s purple-bordered treatment; "default" is `TopReviews`' plain card. */
  variant?: keyof typeof VARIANT_BORDER_CLASSES;
  /** Set per-row by `TopReviews` when that row is the viewer's own review; `YourReview` never sets it — its heading already says "Your review". */
  showYouLabel?: boolean;
  /** Only `YourReview` passes `YourReviewMenu` here — the card doesn't need to know about that component's props. */
  menu?: ReactNode;
  /** List spacing (e.g. `TopReviews`' `mb-[12px] md:mb-[13px]`) is the caller's concern, not the card's. */
  className?: string;
}

/**
 * The review card shared by `YourReview` (pinned, own review, editable) and
 * `TopReviews` (plain list of other users' — and optionally the viewer's own
 * — reviews). See rating-review/rating-06-shared-review-card-spec.md.
 */
export function ReviewCard({
  username,
  profileHref,
  avatarImage,
  rating,
  reviewText,
  reviewedAt,
  variant = "default",
  showYouLabel = false,
  menu,
  className,
}: ReviewCardProps) {
  const starFillPct = rating !== null ? toFillPercent(rating) : 0;
  const letter = username.charAt(0).toUpperCase();
  const date = reviewedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={`relative rounded-[14px] border bg-[#15181e] p-[16px] md:p-[18px] ${VARIANT_BORDER_CLASSES[variant]}${className ? ` ${className}` : ""}`}
    >
      <div className="mb-[11px] flex items-center gap-[11px]">
        {profileHref ? (
          <Link href={profileHref} className={AVATAR_CLASSES}>
            {avatarImage ? (
              <Image src={avatarImage} alt="" width={34} height={34} className="size-full object-cover" />
            ) : (
              letter
            )}
          </Link>
        ) : (
          <div className={AVATAR_CLASSES}>
            {avatarImage ? (
              <Image src={avatarImage} alt="" width={34} height={34} className="size-full object-cover" />
            ) : (
              letter
            )}
          </div>
        )}
        <div className="flex-1">
          {profileHref ? (
            <Link href={profileHref} className="text-[13.5px] font-bold md:text-[14px]">
              {username}
            </Link>
          ) : (
            <span className="text-[13.5px] font-bold md:text-[14px]">{username}</span>
          )}{" "}
          <span className="text-[12px] text-[#7b818c]">
            {showYouLabel ? `· you · ${date}` : `· ${date}`}
          </span>
        </div>
        {rating !== null ? (
          <>
            <span
              className="relative inline-block text-[12.5px] leading-none tracking-[2px] md:text-[14px]"
              style={{ fontFamily: "Arial" }}
            >
              <span style={{ color: "#363b45" }}>★★★★★</span>
              <span
                className="absolute top-0 left-0 overflow-hidden whitespace-nowrap"
                style={{ color: "#e6b450", width: `${starFillPct}%` }}
              >
                ★★★★★
              </span>
            </span>
            <span className="font-heading text-[13px] font-bold text-[#e6b450]">
              {formatRatingValue(rating)}
            </span>
          </>
        ) : (
          <span className="text-[12px] text-[#7b818c]">Not yet rated</span>
        )}
        {menu}
      </div>
      <p className="text-[13.5px] leading-[1.6] whitespace-pre-line text-[#cdd2da] md:text-[14.5px]">
        {reviewText}
      </p>
    </article>
  );
}
