import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Swords,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Eye,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AnimalAvatar from "@/components/AnimalAvatar";
import { AnimalType } from "@/lib/animalConfig";

const STAGE_LABELS = ["Jajko", "Młode", "Dorosłe", "Mistrz"];

interface Participant {
  id: string;
  user_id: string;
  coins_earned: number;
  masked_position: boolean;
  dragon_bonus_days: number;
  final_position: number | null;
  profiles: {
    username: string | null;
    animal_type: string | null;
    animal_stage: number;
    streak_days: number;
    exp: number;
    plan: string;
  };
}

interface TournamentData {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  min_exp: number;
  max_exp: number;
}

interface HistoryEntry {
  id: string;
  final_position: number | null;
  coins_earned: number;
  coin_reward: number;
  exp_reward: number;
  completed_at: string;
}

interface AnimalDef {
  animal_type: string;
  passive_ability_name: string;
  passive_ability_description: string;
}

const Tournament = () => {
  const { user, profile } = useAuth();
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [animalDefs, setAnimalDefs] = useState<AnimalDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCompletions, setTodayCompletions] = useState(0);
  const [totalHabits, setTotalHabits] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, profile?.current_tournament_id]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [animalRes, historyRes, habitsRes, completionsRes] =
      await Promise.all([
        supabase
          .from("animal_definitions")
          .select(
            "animal_type, passive_ability_name, passive_ability_description",
          ),
        supabase
          .from("tournament_history")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(10),
        supabase
          .from("habits")
          .select("id")
          .eq("user_id", user.id)
          .eq("archived", false),
        supabase
          .from("habit_completions")
          .select("id")
          .eq("user_id", user.id)
          .eq("completed_date", new Date().toISOString().split("T")[0]),
      ]);

    setAnimalDefs((animalRes.data as AnimalDef[]) || []);
    setHistory((historyRes.data as HistoryEntry[]) || []);
    setTotalHabits(habitsRes.data?.length || 0);
    setTodayCompletions(completionsRes.data?.length || 0);

    if (profile?.current_tournament_id) {
      const [tRes, pRes] = await Promise.all([
        supabase
          .from("tournaments")
          .select("*")
          .eq("id", profile.current_tournament_id)
          .single(),
        supabase
          .from("tournament_participants")
          .select(
            "*, profiles(username, animal_type, animal_stage, streak_days, exp, plan)",
          )
          .eq("tournament_id", profile.current_tournament_id)
          .order("coins_earned", { ascending: false }),
      ]);
      setTournament(tRes.data as TournamentData | null);
      setParticipants((pRes.data as Participant[]) || []);
    } else {
      setTournament(null);
      setParticipants([]);
    }

    setLoading(false);
  };

  const timeLeft = useMemo(() => {
    if (!tournament) return null;
    const end = new Date(tournament.end_date).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  }, [tournament]);

  const progressPct = useMemo(() => {
    if (!tournament) return 0;
    const start = new Date(tournament.start_date).getTime();
    const end = new Date(tournament.end_date).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  }, [tournament]);

  const getAnimalDef = (type: string | null) =>
    animalDefs.find((a) => a.animal_type === type);

  const myParticipant = participants.find((p) => p.user_id === user?.id);
  const habitsRemaining = Math.max(0, totalHabits - todayCompletions);

  const potentialCoins = useMemo(() => {
    if (!habitsRemaining) return 0;
    let coins = habitsRemaining * 5;
    if (todayCompletions + habitsRemaining >= totalHabits && totalHabits > 0) {
      coins += 20; // complete day bonus
    }
    coins += Math.min(profile?.streak_days || 0, 10);
    return coins;
  }, [habitsRemaining, todayCompletions, totalHabits, profile]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">
          Ładowanie turnieju...
        </div>
      </AppLayout>
    );
  }

  // Waiting screen
  if (!tournament) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" /> Turniej
          </h1>
          <div className="glass-card rounded-xl p-8 text-center space-y-4">
            <div className="text-5xl">⏳</div>
            <h2 className="text-xl font-bold">Oczekiwanie na turniej</h2>
            <p className="text-muted-foreground text-sm">
              Nowe turnieje tworzone są co 10 dni. Zostaniesz automatycznie
              przypisany do grupy na Twoim poziomie EXP.
            </p>
          </div>

          {history.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-3">Historia turniejów</h2>
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {h.final_position === 1
                          ? "🥇"
                          : h.final_position === 2
                            ? "🥈"
                            : h.final_position === 3
                              ? "🥉"
                              : `#${h.final_position}`}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          Pozycja {h.final_position}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(h.completed_at).toLocaleDateString("pl")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold">{h.coins_earned} 🪙 zdobyte</p>
                      <p className="text-primary text-xs">
                        +{h.coin_reward} 🪙 +{h.exp_reward} EXP nagroda
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Active tournament view
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" /> Turniej
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4" /> Pozostało: {timeLeft}
          </p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            EXP bracket: {tournament.min_exp}–
            {tournament.max_exp === 999999 ? "∞" : tournament.max_exp}
          </p>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-3 py-3">#</th>
                <th className="text-left px-3 py-3">Gracz</th>
                <th className="text-right px-3 py-3">Monety 🪙</th>
                <th className="text-right px-3 py-3 hidden sm:table-cell">
                  Seria 🔥
                </th>
                <th className="text-right px-3 py-3 hidden md:table-cell">
                  EXP
                </th>
              </tr>
            </thead>
            <tbody>
              <TooltipProvider>
                {participants.map((p, idx) => {
                  const isMe = p.user_id === user?.id;
                  const animal = getAnimalDef(p.profiles?.animal_type);
                  const showMasked = p.masked_position && !isMe;
                  const pos = idx + 1;

                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b border-border/50 transition-colors ${
                        isMe
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-3 py-3 font-bold text-sm">
                        {showMasked
                          ? "❓"
                          : pos <= 3
                            ? ["🥇", "🥈", "🥉"][pos - 1]
                            : pos}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <AnimalAvatar
                            animalType={
                              (p.profiles?.animal_type || "wolf") as AnimalType
                            }
                            stage={
                              (p.profiles?.animal_stage || 1) as 1 | 2 | 3 | 4
                            }
                            size="sm"
                            animate="none"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span
                                className={`font-medium text-sm truncate ${isMe ? "text-primary" : ""}`}
                              >
                                {showMasked
                                  ? "???"
                                  : p.profiles?.username || "Anonim"}
                                {isMe && " (Ty)"}
                              </span>
                              {p.profiles?.plan === "pro" && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">
                                  PRO
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">
                                {
                                  STAGE_LABELS[
                                    (p.profiles?.animal_stage || 1) - 1
                                  ]
                                }
                              </span>
                              {animal && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-bold text-xs">
                                      {animal.passive_ability_name}
                                    </p>
                                    <p className="text-xs">
                                      {animal.passive_ability_description}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-sm">
                        {showMasked ? "?" : p.coins_earned}
                      </td>
                      <td className="px-3 py-3 text-right text-sm hidden sm:table-cell">
                        {showMasked ? "?" : p.profiles?.streak_days || 0}
                      </td>
                      <td className="px-3 py-3 text-right text-sm hidden md:table-cell">
                        {showMasked ? "?" : p.profiles?.exp || 0}
                      </td>
                    </motion.tr>
                  );
                })}
              </TooltipProvider>
            </tbody>
          </table>
        </div>

        {/* Daily earnings calculator */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Twoje możliwe
            zarobki dziś
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">
                Nawyki do zrobienia
              </p>
              <p className="font-bold">
                {habitsRemaining} / {totalHabits}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                Potencjalne monety
              </p>
              <p className="font-bold text-primary">+{potentialCoins} 🪙</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Twoja pozycja</p>
              <p className="font-bold">
                #{participants.findIndex((p) => p.user_id === user?.id) + 1} z{" "}
                {participants.length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Zdolność pasywna</p>
              <p className="font-bold text-xs">
                {getAnimalDef(profile?.animal_type)?.passive_ability_name ||
                  "—"}
              </p>
            </div>
          </div>
          {myParticipant?.dragon_bonus_days &&
            myParticipant.dragon_bonus_days > 0 && (
              <p className="text-xs text-amber-400">
                🐉 Dragon Bonus aktywny: {myParticipant.dragon_bonus_days} dni
                pozostało
              </p>
            )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Tournament;
