import { NextResponse } from "next/server";
import { getRandomPokemon } from "@/lib/pokemon";

// Always dynamic — every hit should roll a new random Pokémon, never a cached one.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const pokemon = await getRandomPokemon();
  const target = pokemon ? `/p/${pokemon.slug}` : "/";
  return NextResponse.redirect(new URL(target, request.url));
}
