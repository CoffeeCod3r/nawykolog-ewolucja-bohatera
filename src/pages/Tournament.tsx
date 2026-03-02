import AppLayout from "@/components/layout/AppLayout";
import { Swords, Clock } from "lucide-react";

const mockPlayers = [
  { pos: 1, name: "DragonSlayer", animal: "🐉", coins: 420, streak: 14 },
  { pos: 2, name: "WolfPack", animal: "🐺", coins: 385, streak: 12 },
  { pos: 3, name: "Ty", animal: "🐺", coins: 340, streak: 7, isYou: true },
  { pos: 4, name: "EagleEye", animal: "🦅", coins: 310, streak: 9 },
  { pos: 5, name: "LionHeart", animal: "🦁", coins: 280, streak: 6 },
  { pos: 6, name: "PhoenixRise", animal: "🦅", coins: 250, streak: 5 },
  { pos: 7, name: "ShadowWolf", animal: "🐺", coins: 220, streak: 4 },
  { pos: 8, name: "IronDragon", animal: "🐉", coins: 190, streak: 3 },
  { pos: 9, name: "NightOwl", animal: "🦅", coins: 150, streak: 2 },
  { pos: 10, name: "Rookie", animal: "🦁", coins: 90, streak: 1 },
];

const Tournament = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" /> Turniej tygodniowy
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" /> Kończy się za 3 dni 14h
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Gracz</th>
                <th className="text-right px-4 py-3">Monety 🪙</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Seria 🔥</th>
              </tr>
            </thead>
            <tbody>
              {mockPlayers.map((p) => (
                <tr
                  key={p.pos}
                  className={`border-b border-border/50 transition-colors ${
                    p.isYou ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-sm">
                    {p.pos <= 3 ? ["🥇", "🥈", "🥉"][p.pos - 1] : p.pos}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.animal}</span>
                      <span className={`font-medium text-sm ${p.isYou ? "text-primary" : ""}`}>
                        {p.name} {p.isYou && "(Ty)"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-sm">{p.coins}</td>
                  <td className="px-4 py-3 text-right text-sm hidden sm:table-cell">{p.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Tournament;
