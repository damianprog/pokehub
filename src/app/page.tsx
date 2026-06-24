import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Nav } from "@/components/landing/Nav";
import { PackTease } from "@/components/landing/PackTease";
import { Testimonials } from "@/components/landing/Testimonials";
import { Trending } from "@/components/landing/Trending";

export default function Home() {
  return (
    <div className="landing-glow min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <Trending />
      <Testimonials />
      <PackTease />
    </div>
  );
}
