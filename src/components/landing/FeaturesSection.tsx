import { motion } from "framer-motion";
import { Swords, TrendingUp, Trophy, Package, BookOpen, Target } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Ewolucja zwierzęcia",
    description: "Twój towarzysz ewoluuje przez 5 etapów — od jajka do legendarnej formy. Każdy zaliczony nawyk daje EXP.",
  },
  {
    icon: Swords,
    title: "Turnieje 10-osobowe",
    description: "Co tydzień dołączasz do turnieju z 9 innymi graczami o podobnym EXP. Zdobywaj monety i pozycje.",
  },
  {
    icon: Package,
    title: "Itemy CS-style",
    description: "Otwieraj skrzynki i zdobywaj itemy od pospolitych po mityczne. Ubieraj swoje zwierzę w unikalne przedmioty.",
  },
  {
    icon: Trophy,
    title: "Rankingi i odznaczenia",
    description: "Wspinaj się w rankingach województwa i ogólnopolskich. Odblokowuj odznaczenia za osiągnięcia.",
  },
  {
    icon: Target,
    title: "Wyzwania dzienne",
    description: "Codzienne, tygodniowe i miesięczne wyzwania z nagrodami w monetach, EXP i ekskluzywnych itemach.",
  },
  {
    icon: BookOpen,
    title: "Biblioteka tygodnia",
    description: "Co tydzień nowe rekomendacje książek. Głosuj, oceniaj i buduj nawyk czytania z innymi graczami.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="mechanika" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mechanika <span className="text-gradient-primary">gry</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Każdy element platformy zaprojektowany jest tak, abyś chciał wracać codziennie.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
