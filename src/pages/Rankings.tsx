import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";
import { PLAN_BADGES, type PlanTier } from "@/lib/stripe-plans";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tabs = ["Świat", "Polska", "Województwo", "Znajomi", "Turniej"];

const ANIMAL_EMOJI: Record<string, string> = {
  wolf: "🐺", eagle: "🦅", bear: "🐻", fox: "🦊", tiger: "🐯",
  dolphin: "🐬", owl: "🦉", dragon: "🐉", panther: "🐆", turtle: "🐢",
};

interface RankingProfile {
  id: string;
  username: string | null;
  animal_type: string | null;
  animal_stage: number;
  weekly_coins: number;
  province: string | null;
  plan: string;
  streak_days: number;
  exp: number;
}

const Rankings = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profiles, setProfiles] = useState<RankingProfile[]>([]);
  const [tournamentProfiles, setTournamentProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [user, activeTab]);

  const fetchRankings = async () => {
    setLoading(true);

    if (activeTab === 4 && profile?.current_tournament_id) {
      // Tournament tab - get participants
      const { data } = await supabase
        .from("tournament_participants")
        .select("*, profiles(id, username, animal_type, animal_stage, weekly_coins, province, plan, streak_days, exp)")
        .eq("tournament_id", profile.current_tournament_id)
        .order("coins_earned", { ascending: false });
      setTournamentProfiles(data || []);
      setProfiles([]);
    } else {
      // General rankings by weekly_coins - we can only query our own profile + tournament mates
      // For a real app we'd need a server function, but let's query what RLS allows
      const { data } = await supabase
        .from("profiles")
        .select("id, username, animal_type, animal_stage, weekly_coins, province, plan, streak_days, exp")
        .order("weekly_coins", { ascending: false })
        .limit(100);
      setProfiles((data as RankingProfile[]) || []);
      setTournamentProfiles([]);
    }
    setLoading(false);
  };

  const filteredProfiles = useMemo(() => {
    if (activeTab === 4) return []; // handled separately
    let list = [...profiles];

    if (activeTab === 2 && profile?.province) {
      // Województwo
      list = list.filter(p => p.province === profile.province);
    }

    // Sort by weekly_coins
    list.sort((a, b) => b.weekly_coins - a.weekly_coins);
    return list;
  }, [profiles, activeTab, profile]);

  const myRank = useMemo(() => {
    if (activeTab === 4) {
      const idx = tournamentProfiles.findIndex(p => p.profiles?.id === user?.id);
      return idx >= 0 ? idx + 1 : null;
    }
    const idx = filteredProfiles.findIndex(p => p.id === user?.id);
    return idx >= 0 ? idx + 1 : null;
  }, [filteredProfiles, tournamentProfiles, activeTab, user]);

  const renderRow = (p: RankingProfile, idx: number, isMe: boolean) => {
    const pos = idx + 1;
    const planBadge = PLAN_BADGES[p.plan as PlanTier];

    return (
      <motion.tr
        key={p.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.03 }}
        className={cn(
          "border-b border-border/50 transition-colors",
          isMe ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/30"
        )}
      >
        <td className="px-3 py-3 font-bold text-sm">
          {pos <= 3 ? ["🥇", "🥈", "🥉"][pos - 1] : pos}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{ANIMAL_EMOJI[p.animal_type || ""] || "🐾"}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className={cn("font-medium text-sm truncate", isMe && "text-primary")}>
                  {p.username || "Anonim"}{isMe && " (Ty)"}
                </span>
                {planBadge && (
                  <span className={cn("text-[10px] px-1 rounded font-bold", planBadge.className)}>
                    {planBadge.label}
                  </span>
                )}
              </div>
              {p.province && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" /> {p.province}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-right font-bold text-sm">{p.weekly_coins} 🪙</td>
        <td className="px-3 py-3 text-right text-sm hidden sm:table-cell">{p.streak_days} 🔥</td>
        <td className="px-3 py-3 text-right text-sm hidden md:table-cell">{p.exp}</td>
      </motion.tr>
    );
  };

  const renderTournamentRow = (tp: any, idx: number) => {
    const p = tp.profiles as RankingProfile;
    if (!p) return null;
    const isMe = p.id === user?.id;
    const pos = idx + 1;
    const planBadge = PLAN_BADGES[p.plan as PlanTier];

    return (
      <motion.tr
        key={tp.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.03 }}
        className={cn(
          "border-b border-border/50 transition-colors",
          isMe ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/30"
        )}
      >
        <td className="px-3 py-3 font-bold text-sm">
          {tp.masked_position && !isMe ? "❓" : pos <= 3 ? ["🥇", "🥈", "🥉"][pos - 1] : pos}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{ANIMAL_EMOJI[p.animal_type || ""] || "🐾"}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className={cn("font-medium text-sm truncate", isMe && "text-primary")}>
                  {tp.masked_position && !isMe ? "???" : (p.username || "Anonim")}
                  {isMe && " (Ty)"}
                </span>
                {planBadge && (
                  <span className={cn("text-[10px] px-1 rounded font-bold", planBadge.className)}>
                    {planBadge.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-3 py-3 text-right font-bold text-sm">
          {tp.masked_position && !isMe ? "?" : tp.coins_earned} 🪙
        </td>
        <td className="px-3 py-3 text-right text-sm hidden sm:table-cell">
          {tp.masked_position && !isMe ? "?" : p.streak_days} 🔥
        </td>
        <td className="px-3 py-3 text-right text-sm hidden md:table-cell">
          {tp.masked_position && !isMe ? "?" : p.exp}
        </td>
      </motion.tr>
    );
  };

  const dataList = activeTab === 4 ? tournamentProfiles : filteredProfiles;

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

        {loading ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            Ładowanie rankingów...
          </div>
        ) : dataList.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
            {activeTab === 3 ? "Funkcja znajomych — wkrótce dostępna" :
             activeTab === 4 && !profile?.current_tournament_id ? "Nie masz aktywnego turnieju" :
             "Brak danych do wyświetlenia"}
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left px-3 py-3">#</th>
                  <th className="text-left px-3 py-3">Gracz</th>
                  <th className="text-right px-3 py-3">{activeTab === 4 ? "Monety turnieju" : "Tygodniowe"} 🪙</th>
                  <th className="text-right px-3 py-3 hidden sm:table-cell">Seria 🔥</th>
                  <th className="text-right px-3 py-3 hidden md:table-cell">EXP</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 4
                  ? tournamentProfiles.map((tp, idx) => renderTournamentRow(tp, idx))
                  : filteredProfiles.map((p, idx) => renderRow(p, idx, p.id === user?.id))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Sticky own position */}
        {myRank && myRank > 3 && (
          <div className="glass-card rounded-xl p-3 flex items-center justify-between border border-primary/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">#{myRank}</span>
              <span className="text-lg">{ANIMAL_EMOJI[profile?.animal_type || ""] || "🐾"}</span>
              <span className="font-medium text-sm text-primary">{profile?.username || "Ty"}</span>
            </div>
            <span className="font-bold text-sm">{profile?.weekly_coins || 0} 🪙</span>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Rankings;
