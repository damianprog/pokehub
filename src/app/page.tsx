import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";

export default function Home() {
  return (
    <div className="landing-glow min-h-screen">
      <Nav />
      <Hero />
    </div>
  );
}
