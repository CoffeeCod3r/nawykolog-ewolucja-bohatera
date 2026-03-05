import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Swords } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ANIMAL_EMOJI: Record<string, string> = {
  wolf: "🐺", eagle: "🦅", bear: "🐻", fox: "🦊", tiger: "🐯",
  dolphin: "🐬", owl: "🦉", dragon: "🐉", panther: "🐆", turtle: "🐢",
};

const STAGE_LABELS = ["Jajko", "Młode", "Dorosłe", "Mistrz"];
const STAGE_EXP = [0, 500, 2000, 6000];

interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string | null;
}

interface Completion {
  id: string;
  habit_id: string;
}

interface TournamentParticipant {
  user_id: string;
  coins_earned: number;
}

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [tournamentPosition, setTournamentPosition] = useState<number | null>(null);
  const [tournamentTotal, setTournamentTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [evolved, setEvolved] = useState(false);
  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("✅");

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [habitsRes, completionsRes] = await Promise.all([
      supabase.from("habits").select("id, name, emoji, category").eq("user_id", user.id).eq("archived", false).order("created_at"),
      supabase.from("habit_completions").select("id, habit_id").eq("user_id", user.id).eq("completed_date", today),
    ]);

    setHabits((habitsRes.data as Habit[]) || []);
    setCompletions((completionsRes.data as Completion[]) || []);

    // Fetch tournament position
    if (profile?.current_tournament_id) {
      const { data: participants } = await supabase
        .from("tournament_participants")
        .select("user_id, coins_earned")
        .eq("tournament_id", profile.current_tournament_id)
        .order("coins_earned", { ascending: false });

      if (participants) {
        setTournamentTotal(participants.length);
        const pos = participants.findIndex((p: TournamentParticipant) => p.user_id === user.id);
        setTournamentPosition(pos >= 0 ? pos + 1 : null);
      }
    }

    setLoading(false);
  }, [user, profile?.current_tournament_id, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleHabit = async (habitId: string) => {
    if (toggling) return;
    setToggling(habitId);

    // Optimistic update
    const isCompleted = completions.some((c) => c.habit_id === habitId);
    if (isCompleted) {
      setCompletions((prev) => prev.filter((c) => c.habit_id !== habitId));
    } else {
      setCompletions((prev) => [...prev, { id: "temp", habit_id: habitId }]);
    }

    try {
      const { data, error } = await supabase.functions.invoke("toggle-habit", {
        body: { habitId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.evolved) {
        setEvolved(true);
        setTimeout(() => setEvolved(false), 3000);
      }

      // Refresh profile for updated stats
      await refreshProfile();

      // Refresh completions from server
      const { data: freshCompletions } = await supabase
        .from("habit_completions")
        .select("id, habit_id")
        .eq("user_id", user!.id)
        .eq("completed_date", today);
      setCompletions((freshCompletions as Completion[]) || []);

      if (data.action === "completed") {
        if (data.allDone) {
          toast.success("🎉 Wszystkie nawyki ukończone! Brawo!");
        }
        if (data.newAchievements?.length > 0) {
          toast.success("🏅 Nowe odznaczenie odblokowane!");
        }
      }
    } catch {
      // Revert optimistic update
      const { data: freshCompletions } = await supabase
        .from("habit_completions")
        .select("id, habit_id")
        .eq("user_id", user!.id)
        .eq("completed_date", today);
      setCompletions((freshCompletions as Completion[]) || []);
      toast.error("Nie udało się zapisać nawyku. Sprawdź połączenie i spróbuj ponownie.");
    } finally {
      setToggling(null);
    }
  };

  const addHabit = async () => {
    if (!user || !newHabitName.trim()) return;
    try {
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        name: newHabitName.trim(),
        emoji: newHabitEmoji || "✅",
        category: "personal",
        frequency: "daily",
      });
      if (error) throw error;
      toast.success("Nawyk dodany!");
      setNewHabitName("");
      setNewHabitEmoji("✅");
      setAddHabitOpen(false);
      fetchData();
    } catch {
      toast.error("Nie udało się dodać nawyku. Spróbuj ponownie.");
    }
  };

  const completedCount = completions.length;
  const animalEmoji = ANIMAL_EMOJI[profile?.animal_type || ""] || "🐾";
  const animalStage = profile?.animal_stage || 1;
  const nextStageExp = STAGE_EXP[animalStage] || STAGE_EXP[3];
  const prevStageExp = STAGE_EXP[animalStage - 1] || 0;
  const expProgress = nextStageExp > prevStageExp
    ? Math.min(100, ((profile?.exp || 0) - prevStageExp) / (nextStageExp - prevStageExp) * 100)
    : 100;

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Evolution overlay */}
        <AnimatePresence>
          {evolved && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-center space-y-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <motion.div
                  className="text-8xl"
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: 2 }}
                >
                  {animalEmoji}
                </motion.div>
                <h2 className="text-2xl font-bold text-primary">Ewolucja!</h2>
                <p className="text-muted-foreground">Twoje zwierzę osiągnęło etap {animalStage}!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Dzień dobry{profile?.username ? `, ${profile.username}` : ""}! {animalEmoji}
            </h1>
            <p className="text-muted-foreground text-sm">
              Seria: {profile?.streak_days || 0} dni 🔥 • Etap {animalStage}/4
            </p>
          </div>
          <Dialog open={addHabitOpen} onOpenChange={setAddHabitOpen}>
            <DialogTrigger asChild>
              <Button variant="gaming" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Dodaj nawyk
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj nowy nawyk</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Nazwa nawyku..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                />
                <Input
                  placeholder="Emoji (np. 💪)"
                  value={newHabitEmoji}
                  onChange={(e) => setNewHabitEmoji(e.target.value)}
                  maxLength={4}
                />
                <Button variant="hero" className="w-full" onClick={addHabit} disabled={!newHabitName.trim()}>
                  Dodaj nawyk
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Monety", value: (profile?.total_coins || 0).toLocaleString(), icon: "🪙" },
            { label: "EXP", value: (profile?.exp || 0).toLocaleString(), icon: "⚡" },
            { label: "Seria", value: `${profile?.streak_days || 0} dni`, icon: "🔥" },
            { label: "Pozycja", value: tournamentPosition ? `#${tournamentPosition}` : "—", icon: "🏆" },
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
              <span className="text-sm text-muted-foreground">{completedCount}/{habits.length}</span>
            </div>
            {habits.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nie masz jeszcze nawyków. Dodaj pierwszy nawyk!
              </p>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const isCompleted = completions.some((c) => c.habit_id === habit.id);
                  const isToggling = toggling === habit.id;
                  return (
                    <motion.div
                      key={habit.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleHabit(habit.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isCompleted
                          ? "border-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/20"
                      } ${isToggling ? "opacity-50" : ""}`}
                    >
                      <span className="text-xl">{habit.emoji}</span>
                      <span className={`flex-1 font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isCompleted ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {isCompleted && <span className="text-xs text-primary-foreground">✓</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Animal + Tournament */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="text-6xl mb-3 animate-float">{animalEmoji}</div>
              <h3 className="font-bold capitalize">
                {profile?.animal_type || "?"} – {STAGE_LABELS[animalStage - 1]}
              </h3>
              <div className="mt-3 w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(profile?.exp || 0).toLocaleString()} / {nextStageExp.toLocaleString()} EXP
              </p>
            </div>

            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Swords className="w-5 h-5 text-primary" />
                <h3 className="font-bold">
                  {profile?.current_tournament_id ? "Turniej aktywny" : "Brak turnieju"}
                </h3>
              </div>
              {tournamentPosition ? (
                <p className="text-sm text-muted-foreground mb-3">
                  Pozycja: #{tournamentPosition} z {tournamentTotal}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">
                  Oczekiwanie na przypisanie do turnieju
                </p>
              )}
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
