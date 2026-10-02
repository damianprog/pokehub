import { POKEDEX_TYPES, pokedexHref, toggleType, type PokedexFilters } from "@/lib/pokedex-filters";
import { PokedexTypeChip } from "@/components/pokedex/PokedexTypeChip";
import { PokedexGenerationMenu } from "@/components/pokedex/PokedexGenerationMenu";

interface PokedexFilterPanelProps {
  /** Active filters, or `null` for the loading skeleton (same layout, nothing interactive). */
  filters: PokedexFilters | null;
}

const ROW_LABEL =
  "font-heading flex-none text-[11.5px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase";

/** Desktop-only filter card: the Type chip row, then the Refine row (Generation for now). Mobile filters arrive with slice 07's sheet. */
export function PokedexFilterPanel({ filters }: PokedexFilterPanelProps) {
  return (
    <div className="mb-[16px] hidden rounded-[16px] border border-white/[0.06] bg-[#15181e] p-[18px] md:block">
      <div className="mb-[16px] flex items-start gap-[16px]">
        <span className={`${ROW_LABEL} w-[72px] leading-[30px]`}>Type</span>
        <div className="flex flex-1 flex-wrap gap-[7px]">
          {POKEDEX_TYPES.map((type) => (
            <PokedexTypeChip
              key={type}
              type={type}
              selected={filters?.types.includes(type) ?? false}
              href={filters && pokedexHref(toggleType(filters, type))}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-[10px] border-t border-white/[0.06] pt-[14px]">
        <span className={`${ROW_LABEL} w-[78px]`}>Refine</span>
        <PokedexGenerationMenu
          filters={filters ?? { search: "", types: [], gen: null }}
          disabled={filters === null}
        />
      </div>
    </div>
  );
}
