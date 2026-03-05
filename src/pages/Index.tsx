import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EagleAvatars from "@/components/EagleAvatars"; // new eagle profile component

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-bold text-lg">Nawykolog</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#mechanika"
              className="hover:text-foreground transition-colors"
            >
              Mechanika
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Cennik
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/logowanie">
              <Button variant="ghost" size="sm">
                Zaloguj się
              </Button>
            </Link>
            <Link to="/rejestracja">
              <Button variant="gaming" size="sm">
                Graj teraz
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <EagleAvatars />
      <FeaturesSection />
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gotowy na <span className="text-gradient-primary">ewolucję</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Dołącz do tysięcy graczy, którzy już budują nawyki w sposób, jaki
            znają z gier.
          </p>
          <Link to="/rejestracja">
            <Button variant="hero" size="lg" className="text-lg px-10 py-6">
              Rozpocznij przygodę 🎮
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
