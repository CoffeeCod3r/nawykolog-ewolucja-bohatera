import AppLayout from "@/components/layout/AppLayout";
import { Target, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["Dzienne", "Tygodniowe", "Miesięczne"];

const mockChallenges = {
  Dzienne: [
    { title: "Zalicz 3 nawyki", reward: "50 🪙 + 20 EXP", done: true },
    { title: "Bez social media 4h", reward: "30 🪙", done: false },
    { title: "Wypij 8 szklanek wody", reward: "20 🪙", done: false },
  ],
  Tygodniowe: [
    { title: "Seria 7 dni", reward: "200 🪙 + skrzynka", done: false },
    { title: "Top 5 w turnieju", reward: "150 🪙", done: false },
  ],
  Miesięczne: [
    { title: "30 dni serii", reward: "Item Epicki + 500 🪙", done: false },
  ],
};

const Tasks = () => {
  const [activeTab, setActiveTab] = useState(0);
  const currentChallenges = mockChallenges[tabs[activeTab] as keyof typeof mockChallenges];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" /> Wyzwania
        </h1>

        <div className="flex gap-2">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {currentChallenges.map((c) => (
            <div key={c.title} className={`glass-card rounded-xl p-4 flex items-center gap-4 ${c.done ? "opacity-60" : ""}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                c.done ? "border-primary bg-primary" : "border-border"
              }`}>
                {c.done && <span className="text-xs text-primary-foreground">✓</span>}
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${c.done ? "line-through" : ""}`}>{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tasks;
