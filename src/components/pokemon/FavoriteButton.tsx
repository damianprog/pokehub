"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setFavorite } from "@/actions/favorite";
import { runAction } from "@/lib/run-action";
import { useAuthModal } from "@/store/auth-modal";

// Sourced from `PokeHub-PokemonDetail-Mobile.dc.html`'s script block — the
// only design artboard that actually implements a favorited-state color.
// Reused on desktop too since no desktop artboard has a favorited color of
// its own (favorite-wishlist-01-favorite-toggle-spec.md §3).
const UNFAVORITED_COLOR = "#e8a0c0";
const FAVORITED_COLOR = "#ff5d8f";
const FAVORITED_BG = "rgba(255,93,143,0.18)";

interface FavoriteButtonProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  initialIsFavorite: boolean;
  className?: string;
}

export function FavoriteButton({
  pokemonId,
  slug,
  pokemonName,
  isAuthenticated,
  initialIsFavorite,
  className,
}: FavoriteButtonProps) {
  const { open } = useAuthModal();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  async function handleClick() {
    if (!isAuthenticated) {
      open("login");
      return;
    }

    const nextIsFavorite = !isFavorite;
    setIsFavorite(nextIsFavorite);

    const result = await runAction(setFavorite({ pokemonId, slug, isFavorite: nextIsFavorite }));
    if (result.success) {
      toast.success(
        nextIsFavorite ? `Added ${pokemonName} to favorites.` : `Removed ${pokemonName} from favorites.`,
      );
    } else {
      setIsFavorite(!nextIsFavorite);
      toast.error(result.error);
    }
  }

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isFavorite}
      onClick={handleClick}
      className={className}
      style={{
        color: isFavorite ? FAVORITED_COLOR : UNFAVORITED_COLOR,
        backgroundColor: isFavorite ? FAVORITED_BG : undefined,
      }}
    >
      ♥
    </button>
  );
}
