import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return { title: pokemon ? `${pokemon.name} — PokeHub` : "Pokémon — PokeHub" };
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  if (!pokemon) notFound();

  return <pre>{JSON.stringify(pokemon, null, 2)}</pre>;
}
