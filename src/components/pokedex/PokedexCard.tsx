import Image from "next/image";
import Link from "next/link";
import type { PokedexEntry } from "@/lib/pokemon";
import type { RatingSummary, ViewerPokemonFlags } from "@/lib/user-pokemon";
import { toFillPercent, toStars } from "@/lib/rating";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";
import { TYPE_BADGE_COLORS, FALLBACK_BADGE_COLOR } from "@/lib/type-badge-colors";
import { PokedexCardRating } from "@/components/pokedex/PokedexCardRating";
import { PokedexCardIndicators } from "@/components/pokedex/PokedexCardIndicators";
import { PokedexCardYouRated } from "@/components/pokedex/PokedexCardYouRated";
import { PokedexCardToggles } from "@/components/pokedex/PokedexCardToggles";

interface PokedexCardProps {
  pokemon: PokedexEntry;
  rating: RatingSummary | undefined;
  /** The viewer's flags for this Pokémon, or `null` when logged out (no personal layer at all). */
  viewer: ViewerPokemonFlags | null;
}

/**
 * One Pokédex card. The card is a container, not a link: the link fills it
 * and the desktop toggles sit beside it as siblings, since buttons can't live
 * inside a link.
 */
export function PokedexCard({ pokemon, rating, viewer }: PokedexCardProps) {
  const gradient = TYPE_GRADIENTS[pokemon.types[0]] ?? FALLBACK_GRADIENT;

  return (
    <div className="group/card relative flex rounded-[13px] border border-white/[0.07] bg-[#15181e] transition-[transform,border-color,box-shadow] duration-150 ease-out md:rounded-[14px] md:hover:-translate-y-[3px] md:hover:border-white/[0.18] md:hover:shadow-[0_14px_32px_rgba(0,0,0,0.45)]">
      <Link
        href={`/p/${pokemon.slug}`}
        className="flex w-full flex-col rounded-[inherit] p-[10px] md:p-[12px]"
      >
        <div
          className="relative mb-[9px] aspect-square overflow-hidden rounded-[10px] md:mb-[11px] md:rounded-[11px]"
          style={{ background: gradient.bg }}
        >
          <Image
            src={pokemon.artworkUrl}
            alt={pokemon.name}
            fill
            sizes="(min-width: 1024px) 180px, (min-width: 768px) 25vw, 50vw"
            className="object-contain p-[5px] md:p-[6px]"
          />
          {viewer && <PokedexCardIndicators isFavorite={viewer.isFavorite} isWishlist={viewer.isWishlist} />}
        </div>

        <div className="font-heading text-[11px] tracking-[0.05em] text-[#7b818c] md:text-[11.5px]">
          #{String(pokemon.id).padStart(3, "0")}
        </div>
        <div className="font-heading mt-[1px] mb-[7px] truncate text-[14px] font-bold tracking-[-0.01em] md:mb-[8px] md:text-[15px]">
          {pokemon.name}
        </div>

        <div className="mb-[9px] flex flex-wrap gap-[4px] md:mb-[11px] md:gap-[5px]">
          {pokemon.types.map((type) => {
            const badge = TYPE_BADGE_COLORS[type];
            const colors = badge ?? FALLBACK_BADGE_COLOR;
            return (
              <span
                key={type}
                className="inline-flex h-[18px] items-center rounded-[5px] px-[7px] text-[9.5px] font-bold tracking-[0.04em] uppercase md:h-[20px] md:rounded-[6px] md:px-[8px] md:text-[10px]"
                style={{ background: colors.bg, color: colors.color }}
              >
                {badge?.label ?? type}
              </span>
            );
          })}
        </div>

        <div className="mt-auto">
          {rating ? (
            <PokedexCardRating
              average={toStars(rating.averageHalfUnits).toFixed(1)}
              fillPercent={toFillPercent(rating.averageHalfUnits)}
              totalRatings={rating.totalRatings}
            />
          ) : (
            <div className="text-[11.5px] leading-[16px] text-[#7b818c] italic md:text-[12px]">
              No ratings yet
            </div>
          )}
          {viewer?.rating != null && <PokedexCardYouRated rating={viewer.rating} />}
        </div>
      </Link>

      {viewer && (
        <PokedexCardToggles
          pokemonId={pokemon.id}
          slug={pokemon.slug}
          pokemonName={pokemon.name}
          initialIsFavorite={viewer.isFavorite}
          initialIsWishlist={viewer.isWishlist}
        />
      )}
    </div>
  );
}
