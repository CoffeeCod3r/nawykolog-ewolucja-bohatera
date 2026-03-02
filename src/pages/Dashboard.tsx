import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Flame, Trophy, Swords, BookOpen, Target, ShoppingBag, Settings, User, BarChart3 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const mockHabits = [
  { id: 1, name: "Medytacja", emoji: "🧘", completed: true },
  { id: 2, name: "Czytanie 30 min", emoji: "📖", completed: true },
  { id: 3, name: "Trening", emoji: "💪", completed: false },
  { id: 4, name: "Brak social media", emoji: "📵", completed: false },
  { id: 5, name: "Woda 2L", emoji: "💧", completed: true },
];

const Dashboard = () => {
  const completedCount = mockHabits.filter((h) => h.completed).length;

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dzień dobry, Wojowniku! 🐺</h1>
            <p className="text-muted-foreground text-sm">Seria: 7 dni 🔥 • Etap 3/5</p>
          </div>
          <Button variant="gaming" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Dodaj nawyk
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monety", value: "1,250", icon: "🪙" },
            { label: "EXP", value: "3,480", icon: "⚡" },
            { label: "Seria", value: "7 dni", icon: "🔥" },
            { label: "Pozycja", value: "#3", icon: "🏆" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habits */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Dzisiejsze nawyki</h2>
              <span className="text-sm text-muted-foreground">{completedCount}/{mockHabits.length}</span>
            </div>
            <div className="space-y-3">
              {mockHabits.map((habit) => (
                <motion.div
                  key={habit.id}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    habit.completed
                      ? "border-primary/30 bg-primary/5"
                      : "border-border hover:border-primary/20"
                  }`}
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <span className={`flex-1 font-medium text-sm ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                    {habit.name}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    habit.completed ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {habit.completed && <span className="text-xs text-primary-foreground">✓</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animal + Tournament */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-6xl mb-3 animate-float">🐺</div>
              <h3 className="font-bold">Wilk – Etap 3</h3>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">3,480 / 5,000 EXP</p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Swords className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Turniej aktywny</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Pozycja: #3 z 10</p>
              <Link to="/turniej">
                <Button variant="outline" size="sm" className="w-full">
                  Zobacz turniej
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
