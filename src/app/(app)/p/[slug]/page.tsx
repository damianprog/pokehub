import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPokemon } from "@/lib/pokemon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { PokemonArtwork } from "@/components/pokemon/PokemonArtwork";

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

  const primaryType = pokemon.types[0];
  const typeLabel = primaryType.charAt(0).toUpperCase() + primaryType.slice(1);

  return (
    <div>
      <div className="mb-[18px]">
        <Breadcrumb
          items={[
            { label: "Browse", href: "/discover" },
            { label: typeLabel },
            { label: pokemon.name },
          ]}
        />
      </div>
      <div className="grid gap-[34px] items-start" style={{ gridTemplateColumns: "392px 1fr" }}>
        <div className="sticky top-[90px]">
          <PokemonArtwork
            id={pokemon.id}
            name={pokemon.name}
            artworkUrl={pokemon.artworkUrl}
            types={pokemon.types}
          />
        </div>
        <div>{/* info column — next iterations */}</div>
      </div>
    </div>
  );
}
