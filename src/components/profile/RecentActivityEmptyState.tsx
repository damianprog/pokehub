/**
 * "No activity yet" — shown for a profile owner with zero written reviews.
 * Static, no CTA: unlike `TopReviewsEmptyState` there's no single Pokémon to
 * point a "Write review" button at here.
 */
export function RecentActivityEmptyState() {
  return (
    <div className="rounded-[14px] border border-dashed border-white/10 bg-[#13161b] px-[24px] py-[34px] text-center">
      <div className="mb-[12px] text-[26px] opacity-80">✎</div>
      <div className="font-heading text-[18px] font-bold">No activity yet</div>
      <p className="mx-auto mt-[8px] max-w-[380px] text-[13.5px] leading-[1.6] text-[#8b919e]">
        Reviews will show up here once they&apos;re posted.
      </p>
    </div>
  );
}
