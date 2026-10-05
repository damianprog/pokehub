import {
  NO_POKEDEX_FILTERS,
  POKEDEX_GENERATIONS,
  POKEDEX_RARITIES,
  POKEDEX_TYPES,
  pokedexHref,
  toggleType,
  type PokedexFilters,
} from "@/lib/pokedex-filters";
import { PokedexTypeChip } from "@/components/pokedex/PokedexTypeChip";
import { PokedexRefineMenu, type PokedexRefineOption } from "@/components/pokedex/PokedexRefineMenu";
import { PokedexSortMenu } from "@/components/pokedex/PokedexSortMenu";

interface PokedexFilterPanelProps {
  /** Active filters, or `null` for the loading skeleton (same layout, nothing interactive). */
  filters: PokedexFilters | null;
}

const ROW_LABEL =
  "font-heading flex-none text-[11.5px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase";

function generationOptions(filters: PokedexFilters): PokedexRefineOption[] {
  return [
    { gen: null, label: "All generations", sub: null },
    ...POKEDEX_GENERATIONS.map(({ gen, region }) => ({ gen, label: `Gen ${gen}`, sub: region })),
  ].map(({ gen, label, sub }) => ({
    label,
    sub,
    href: pokedexHref({ ...filters, gen }),
    selected: filters.gen === gen,
  }));
}

function rarityOptions(filters: PokedexFilters): PokedexRefineOption[] {
  return [
    { rarity: null, label: "All rarities", sub: null },
    ...POKEDEX_RARITIES.map((rarity) => ({ rarity, label: rarity.label, sub: rarity.sub })),
  ].map(({ rarity, label, sub }) => ({
    label,
    sub,
    href: pokedexHref({ ...filters, rarity }),
    selected: filters.rarity?.key === rarity?.key,
  }));
}

/** Desktop-only filter card: the Type chip row, then the Refine row's menus with Sort on the far right. Mobile filters arrive with slice 07's sheet. */
export function PokedexFilterPanel({ filters }: PokedexFilterPanelProps) {
  const current = filters ?? NO_POKEDEX_FILTERS;
  const disabled = filters === null;

  return (
    <div className="mb-[16px] hidden rounded-[16px] border border-white/[0.06] bg-[#15181e] p-[18px] md:block">
      <div className="mb-[16px] flex items-start gap-[16px]">
        <span className={`${ROW_LABEL} w-[72px] leading-[30px]`}>Type</span>
        <div className="flex flex-1 flex-wrap gap-[7px]">
          {POKEDEX_TYPES.map((type) => (
            <PokedexTypeChip
              key={type}
              type={type}
              selected={current.types.includes(type)}
              href={disabled ? null : pokedexHref(toggleType(current, type))}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-[10px] border-t border-white/[0.06] pt-[14px]">
        <span className={`${ROW_LABEL} w-[78px]`}>Refine</span>
        <PokedexRefineMenu
          label="Generation"
          value={current.gen !== null ? `Gen ${current.gen}` : "All"}
          active={current.gen !== null}
          options={generationOptions(current)}
          disabled={disabled}
        />
        <PokedexRefineMenu
          label="Rarity"
          value={current.rarity?.label ?? "All"}
          active={current.rarity !== null}
          options={rarityOptions(current)}
          disabled={disabled}
        />
        <div className="flex-1" />
        <PokedexSortMenu filters={current} disabled={disabled} />
      </div>
    </div>
  );
}
