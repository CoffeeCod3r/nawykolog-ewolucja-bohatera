import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Nawykolog arena z ewoluującymi zwierzętami"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            🎮 Platforma wzrostu osobistego
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Wybierz swoje zwierzę.{" "}
          <span className="text-gradient-primary">Buduj nawyki.</span>{" "}
          <br className="hidden md:block" />
          Ewoluuj. <span className="text-gradient-gold">Rywalizuj.</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Zamień nudne nawyki w epicką grę. Twoje zwierzę ewoluuje z każdym zaliczonym nawykiem.
          Rywalizuj w turniejach 10-osobowych i zbieraj legendarne itemy.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link to="/rejestracja">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Zacznij za darmo 🚀
            </Button>
          </Link>
          <Link to="#mechanika">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Jak to działa?
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="mt-12 flex items-center justify-center gap-8 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🐺</span>
            <span>Wilk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🦅</span>
            <span>Orzeł</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🐉</span>
            <span>Smok</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg">🦁</span>
            <span>Lew</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
