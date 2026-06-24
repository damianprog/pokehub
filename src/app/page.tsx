import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Nav } from "@/components/landing/Nav";

export default function Home() {
  return (
    <div className="landing-glow min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <FeaturesGrid />
    </div>
  );
}
