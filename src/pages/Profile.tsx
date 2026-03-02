import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";

const mockItems = [
  { name: "Zbroja Cienia", rarity: "epic" as const, equipped: true },
  { name: "Miecz Ognia", rarity: "legendary" as const, equipped: true },
  { name: "Tarcza Lodu", rarity: "rare" as const, equipped: false },
  { name: "Hełm Stalowy", rarity: "common" as const, equipped: false },
];

const rarityColors: Record<string, string> = {
  common: "bg-rarity-common/20 text-rarity-common border-rarity-common/30",
  rare: "bg-rarity-rare/20 text-rarity-rare border-rarity-rare/30",
  epic: "bg-rarity-epic/20 text-rarity-epic border-rarity-epic/30",
  legendary: "bg-rarity-legendary/20 text-rarity-legendary border-rarity-legendary/30",
  mythic: "bg-rarity-mythic/20 text-rarity-mythic border-rarity-mythic/30",
};

const rarityLabels: Record<string, string> = {
  common: "Pospolity",
  rare: "Rzadki",
  epic: "Epicki",
  legendary: "Legendarny",
  mythic: "Mityczny",
};

const Profile = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="text-7xl mb-4 animate-float">🐺</div>
          <h1 className="text-2xl font-bold">Wojownik</h1>
          <p className="text-muted-foreground text-sm">Wilk — Etap 3 | Mazowieckie</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div><span className="font-bold">3,480</span> <span className="text-muted-foreground">EXP</span></div>
            <div><span className="font-bold">1,250</span> <span className="text-muted-foreground">🪙</span></div>
            <div><span className="font-bold">7</span> <span className="text-muted-foreground">dni 🔥</span></div>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Ekwipunek</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockItems.map((item) => (
              <div key={item.name} className={`glass-card rounded-lg p-4 border ${item.equipped ? "border-primary/30" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[item.rarity]}`}>
                    {rarityLabels[item.rarity]}
                  </span>
                </div>
                {item.equipped && <p className="text-xs text-primary mt-1">Założony</p>}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Odznaczenia</h2>
          <div className="flex flex-wrap gap-2">
            {["🏅 7 dni z rzędu", "⚔️ Pierwszy turniej", "📖 Czytelnik"].map((a) => (
              <span key={a} className="glass-card px-3 py-1.5 rounded-full text-sm">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
