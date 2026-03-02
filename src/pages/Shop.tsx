import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const lootBoxes = [
  { name: "Skrzynka Starter", price: 100, guaranteed: "common", emoji: "📦" },
  { name: "Skrzynka Rzadka", price: 300, guaranteed: "rare", emoji: "🎁", glow: "glow-rare" },
  { name: "Skrzynka Epicka", price: 750, guaranteed: "epic", emoji: "✨", glow: "glow-epic" },
  { name: "Skrzynka Legendarna", price: 1500, guaranteed: "legendary", emoji: "🔥", glow: "glow-gold" },
];

const Shop = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Sklep
          </h1>
          <p className="text-muted-foreground text-sm">Twoje monety: 1,250 🪙</p>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-4">Skrzynki</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lootBoxes.map((box) => (
              <div key={box.name} className={`glass-card rounded-xl p-6 text-center ${box.glow || ""}`}>
                <div className="text-5xl mb-3">{box.emoji}</div>
                <h3 className="font-bold text-sm mb-1">{box.name}</h3>
                <p className="text-muted-foreground text-xs mb-4">
                  Gwarantowany: {box.guaranteed}
                </p>
                <Button variant="gaming" size="sm" className="w-full">
                  {box.price} 🪙
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-4">Item Store</h2>
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            <p>Sklep z itemami — wkrótce dostępny</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Shop;
