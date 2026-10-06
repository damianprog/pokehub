import { ListFilter } from "lucide-react";

/** The mobile Filters button's look — on the sheet trigger and the skeleton's disabled button. */
export const FILTERS_BUTTON_CLASS =
  "inline-flex h-[40px] items-center gap-[8px] rounded-[11px] border border-white/[0.1] bg-white/[0.05] px-[13px] text-[13.5px] font-bold whitespace-nowrap select-none hover:bg-white/[0.08] disabled:hover:bg-white/[0.05]";

interface PokedexFiltersButtonContentProps {
  /** Active filters, shown as a badge when above zero. */
  count: number;
}

/** Icon, "Filters" and the active-filter count badge. */
export function PokedexFiltersButtonContent({ count }: PokedexFiltersButtonContentProps) {
  return (
    <>
      <ListFilter aria-hidden className="size-[14px] text-[#cdd2da]" strokeWidth={2.4} />
      Filters
      {count > 0 && (
        <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[6px] text-[11px] font-extrabold text-brand-ink">
          {count}
          <span className="sr-only"> active</span>
        </span>
      )}
    </>
  );
}
