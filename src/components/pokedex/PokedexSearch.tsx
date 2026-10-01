"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  normalizePokedexSearch,
  POKEDEX_SEARCH_MAX_LENGTH,
} from "@/lib/pokedex-search";

const DEBOUNCE_MS = 300;

interface PokedexSearchProps {
  /** The page's current `q`, already run through `normalizePokedexSearch`. */
  query: string;
}

/**
 * Live Pokédex search: debounced `router.replace` of the `q` param, so the
 * grid (a server render) narrows as you type without a history entry per
 * keystroke. Wrapped in a GET form so Enter still searches without JS.
 */
export function PokedexSearch({ query }: PokedexSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The input owns its text; `sentQuery` is the last value we navigated to.
  // While one of our navigations is pending, `query` still holds the old value
  // (or an older result of ours), so leave the field alone. Once settled, a
  // `query` that matches it is our own navigation — keep what the user has
  // typed since. Anything else ("Clear search", a failed navigation) is an
  // outside change, so re-sync the field to it.
  const [value, setValue] = useState(query);
  const [sentQuery, setSentQuery] = useState(query);
  if (query !== sentQuery && !isPending) {
    setSentQuery(query);
    setValue(query);
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function apply(next: string) {
    clearTimeout(timerRef.current);
    const normalized = normalizePokedexSearch(next);
    if (normalized === sentQuery) return;
    setSentQuery(normalized);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("count");
    if (normalized) params.set("q", normalized);
    else params.delete("q");
    const qs = params.toString();

    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function handleChange(next: string) {
    setValue(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => apply(next), DEBOUNCE_MS);
  }

  function handleClear() {
    setValue("");
    apply("");
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      action="/pokedex"
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
      // Read by the page's `group-has-[[data-pending]]` to dim the results.
      data-pending={isPending || undefined}
      className="relative flex h-[44px] min-w-0 flex-1 items-center gap-[8px] rounded-[12px] border border-white/[0.09] bg-white/[0.05] px-[13px] focus-within:border-white/[0.2] md:w-[360px] md:flex-none md:gap-[9px] md:px-[14px]"
    >
      <Search
        aria-hidden
        className="size-[16px] flex-none text-[#7b818c] md:size-[17px]"
        strokeWidth={2.2}
      />

      <div className="relative h-full min-w-0 flex-1">
        {value === "" && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center truncate text-[14px] text-[#646b78]"
          >
            <span className="md:hidden">Name or dex number</span>
            <span className="hidden md:inline">
              Search by name or dex number
            </span>
          </span>
        )}
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          maxLength={POKEDEX_SEARCH_MAX_LENGTH}
          aria-label="Search Pokémon by name or dex number"
          autoComplete="off"
          spellCheck={false}
          className="h-full w-full border-0 bg-transparent text-[14px] text-[#e8eaed] outline-none [&::-webkit-search-cancel-button]:appearance-none"
        />
      </div>

      {value !== "" && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="-mr-[4px] flex size-[28px] flex-none items-center justify-center rounded-[8px] text-[#7b818c] hover:bg-white/[0.08] hover:text-[#e8eaed]"
        >
          <X aria-hidden className="size-[15px]" strokeWidth={2.4} />
        </button>
      )}
    </form>
  );
}
