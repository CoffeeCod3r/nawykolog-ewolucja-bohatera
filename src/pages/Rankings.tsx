import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["Ogólny", "Województwo", "Seria", "EXP", "Turnieje"];

const Rankings = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">🏆 Rankingi</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          <p>Ranking „{tabs[activeTab]}" — wkrótce dostępny</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Rankings;
