import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "za darmo",
    description: "Idealne na początek przygody",
    features: [
      "3 nawyki dziennie",
      "Podstawowa ewolucja zwierzęcia",
      "Turnieje tygodniowe",
      "Podstawowe itemy",
      "Wyzwania dzienne",
    ],
    cta: "Zacznij za darmo",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "29",
    period: "/miesiąc",
    description: "Dla poważnych graczy nawyków",
    features: [
      "Nieograniczone nawyki",
      "Pełna ewolucja + ekskluzywne formy",
      "Turnieje priorytetowe",
      "Skrzynki premium",
      "Wszystkie wyzwania",
      "Biblioteka pełna",
      "Statystyki zaawansowane",
    ],
    cta: "Wybierz Pro",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Legenda",
    price: "59",
    period: "/miesiąc",
    description: "Dla tych, co chcą być legendą",
    features: [
      "Wszystko z Pro",
      "Ekskluzywne mityczne itemy",
      "Własne turnieje prywatne",
      "Priorytetowe matchmaking",
      "Odznaka legendy",
      "Early access do nowych funkcji",
      "Brak reklam",
    ],
    cta: "Zostań Legendą",
    variant: "gold" as const,
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Wybierz swój <span className="text-gradient-gold">plan</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Zacznij za darmo. Ulepsz, gdy poczujesz moc nawyków.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-card rounded-xl p-8 relative ${
                plan.popular ? "border-primary/50 glow-primary" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Najpopularniejszy
                </span>
              )}
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-black">{plan.price} zł</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <Link to="/rejestracja">
                <Button variant={plan.variant} className="w-full mb-6">
                  {plan.cta}
                </Button>
              </Link>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
