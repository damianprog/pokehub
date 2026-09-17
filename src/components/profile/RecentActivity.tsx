import Image from "next/image";
import Link from "next/link";
import type { RecentReviewItem } from "@/lib/user-pokemon";
import { formatRatingValue, toFillPercent } from "@/lib/rating";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";
import { RecentActivityEmptyState } from "@/components/profile/RecentActivityEmptyState";

interface RecentActivityProps {
  activity: RecentReviewItem[];
}

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <div>
      <h2 className="font-heading m-0 mb-[16px] text-[18px] font-bold">Recent activity</h2>
      {activity.length === 0 ? (
        <RecentActivityEmptyState />
      ) : (
        <div className="flex flex-col gap-[14px]">
          {activity.map((item) => {
            const primaryType = item.types[0];
            const gradient = TYPE_GRADIENTS[primaryType] ?? FALLBACK_GRADIENT;
            const badgeColor = TYPE_BADGE_COLORS[primaryType] ?? FALLBACK_BADGE_COLOR;
            const starFillPct = item.rating !== null ? toFillPercent(item.rating) : 0;
            const date = item.reviewedAt.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <article
                key={item.id}
                className="flex gap-[14px] rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[18px]"
              >
                <Link
                  href={`/p/${item.slug}`}
                  className="relative aspect-square w-[60px] flex-none overflow-hidden rounded-[11px]"
                  style={{ background: gradient.bg }}
                >
                  <Image
                    src={item.artworkUrl}
                    alt={item.name}
                    fill
                    className="object-contain p-[4px]"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="mb-[5px] text-[13px] text-[#9aa0ab]">
                    reviewed{" "}
                    <span className="font-semibold" style={{ color: badgeColor.color }}>
                      {item.name}
                    </span>{" "}
                    · {date}
                  </div>
                  <div className="mb-[7px] flex items-center gap-[9px]">
                    {item.rating !== null ? (
                      <>
                        <span
                          className="relative inline-block text-[14px] leading-none tracking-[2px]"
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
                          {formatRatingValue(item.rating)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[12px] text-[#7b818c]">Not yet rated</span>
                    )}
                  </div>
                  <p className="m-0 text-[14px] leading-[1.5] text-[#cdd2da]">{item.reviewText}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
