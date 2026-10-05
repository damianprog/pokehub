import { POKEDEX_SORTS, pokedexHref, type PokedexFilters } from "@/lib/pokedex-filters";
import { PokedexRefineMenu } from "@/components/pokedex/PokedexRefineMenu";

interface PokedexSortMenuProps {
  filters: PokedexFilters;
  /** Mobile's value-only trigger. */
  compact?: boolean;
  /** Inert, for the loading skeleton. */
  disabled?: boolean;
}

/**
 * The Sort dropdown, shared by the desktop Refine row and the mobile sort row.
 * Sort isn't a filter, so its trigger never takes the tinted active look.
 */
export function PokedexSortMenu({ filters, compact = false, disabled = false }: PokedexSortMenuProps) {
  return (
    <PokedexRefineMenu
      label="Sort"
      value={filters.sort.label}
      active={false}
      options={POKEDEX_SORTS.map((sort) => ({
        label: sort.label,
        href: pokedexHref({ ...filters, sort }),
        selected: filters.sort.key === sort.key,
      }))}
      align="end"
      narrow
      compact={compact}
      disabled={disabled}
    />
  );
}
