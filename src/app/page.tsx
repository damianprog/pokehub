import { AuthModal } from "@/components/auth/AuthModal";
import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { PackTease } from "@/components/landing/PackTease";
import { Testimonials } from "@/components/landing/Testimonials";
import { Trending } from "@/components/landing/Trending";

export default function Home() {
  return (
    <div className="landing-glow min-h-screen">
      <Hero />
      <Marquee />
      <Features />
      <Trending />
      <Testimonials />
      <PackTease />
      <FinalCta />
      <Footer />
      <AuthModal />
    </div>
  );
}
