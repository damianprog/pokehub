import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { PackTease } from "@/components/landing/PackTease";
import { Testimonials } from "@/components/landing/Testimonials";
import { Trending } from "@/components/landing/Trending";
import { getPokemonCount } from "@/lib/pokemon";

export default async function Home() {
  const pokemonCount = await getPokemonCount();

  return (
    <div className="landing-glow min-h-screen">
      <Hero pokemonCount={pokemonCount} />
      <Marquee />
      <Features />
      <Trending pokemonCount={pokemonCount} />
      <Testimonials />
      <PackTease />
      <FinalCta />
      <Footer />
    </div>
  );
}
