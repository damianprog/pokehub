import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Nav } from "@/components/landing/Nav";
import { TrendingGrid } from "@/components/landing/TrendingGrid";

export default function Home() {
  return (
    <div className="landing-glow min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <FeaturesGrid />
      <TrendingGrid />
    </div>
  );
}
