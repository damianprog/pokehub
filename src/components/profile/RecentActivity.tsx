import Image from "next/image";
import Link from "next/link";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";

interface RecentActivityItem {
  id: number;
  slug: string;
  name: string;
  types: string[];
  artworkUrl: string;
  timeLabel: string;
  rating: number;
  quote: string;
}

interface RecentActivityProps {
  activity: RecentActivityItem[];
}

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <div className="mt-[34px] px-[16px] md:px-[26px]">
      <h2 className="font-heading m-0 mb-[16px] text-[18px] font-bold">Recent activity</h2>
      <div className="flex flex-col gap-[14px]">
        {activity.map((item) => {
          const primaryType = item.types[0];
          const gradient = TYPE_GRADIENTS[primaryType] ?? FALLBACK_GRADIENT;
          const badgeColor = TYPE_BADGE_COLORS[primaryType] ?? FALLBACK_BADGE_COLOR;
          const starFillPct = Math.min(100, Math.max(0, (item.rating / 5) * 100));

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
                  · {item.timeLabel}
                </div>
                <div className="mb-[7px] flex items-center gap-[9px]">
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
                </div>
                <p className="m-0 text-[14px] leading-[1.5] text-[#cdd2da]">
                  &quot;{item.quote}&quot;
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
