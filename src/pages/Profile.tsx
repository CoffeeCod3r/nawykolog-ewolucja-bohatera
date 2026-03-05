import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AnimalAvatar from "@/components/AnimalAvatar";
import { AnimalType } from "@/lib/animalConfig";

const ANIMAL_NAMES: Record<string, string> = {
  wolf: "Wilk",
  eagle: "Orzeł",
  bear: "Niedźwiedź",
  fox: "Lis",
  tiger: "Tygrys",
  dolphin: "Delfin",
  owl: "Sowa",
  dragon: "Smok",
  pantera: "Pantera",
  turtle: "Żółw",
};

const STAGE_LABELS = ["Jajko", "Młode", "Dorosłe", "Mistrz"];

const ACHIEVEMENT_LABELS: Record<string, string> = {
  first_completion: "🏅 Pierwszy nawyk",
  streak_7: "🔥 7 dni z rzędu",
  streak_30: "💪 30 dni z rzędu",
  streak_100: "⚡ 100 dni z rzędu",
  streak_365: "👑 365 dni z rzędu",
};

const rarityColors: Record<string, string> = {
  common: "bg-muted/20 text-muted-foreground border-muted-foreground/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  mythic: "bg-red-500/20 text-red-400 border-red-500/30",
};

const rarityLabels: Record<string, string> = {
  common: "Pospolity",
  rare: "Rzadki",
  epic: "Epicki",
  legendary: "Legendarny",
  mythic: "Mityczny",
};

interface UserItem {
  id: string;
  is_equipped: boolean;
  items: {
    name: string;
    rarity: string;
  };
}

interface Achievement {
  achievement_id: string;
}

const Profile = () => {
  const { user, profile } = useAuth();
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [itemsRes, achRes] = await Promise.all([
        supabase
          .from("user_items")
          .select("id, is_equipped, items(name, rarity)")
          .eq("user_id", user.id),
        supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", user.id),
      ]);
      setUserItems((itemsRes.data as unknown as UserItem[]) || []);
      setAchievements((achRes.data as Achievement[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const animalType = (profile?.animal_type || "wolf") as AnimalType;
  const animalStage = (profile?.animal_stage || 1) as 1 | 2 | 3 | 4;
  const animalName = ANIMAL_NAMES[profile?.animal_type || ""] || "?";
  const stageName = STAGE_LABELS[(profile?.animal_stage || 1) - 1];
  const equippedItems = userItems.filter((i) => i.is_equipped);
  const unequippedItems = userItems.filter((i) => !i.is_equipped);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mb-4 flex justify-center">
            <AnimalAvatar
              animalType={animalType}
              stage={animalStage}
              size="xl"
              animate="idle"
              showGlow={true}
            />
          </div>
          <h1 className="text-2xl font-bold">{profile?.username || "Gracz"}</h1>
          <p className="text-muted-foreground text-sm capitalize">
            {animalName} — {stageName} |{" "}
            {profile?.province || "Brak województwa"}
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div>
              <span className="font-bold">
                {(profile?.exp || 0).toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">EXP</span>
            </div>
            <div>
              <span className="font-bold">
                {(profile?.total_coins || 0).toLocaleString()}
              </span>{" "}
              <span className="text-muted-foreground">🪙</span>
            </div>
            <div>
              <span className="font-bold">{profile?.streak_days || 0}</span>{" "}
              <span className="text-muted-foreground">dni 🔥</span>
            </div>
          </div>
          {profile?.plan && profile.plan !== "free" && (
            <span className="inline-block mt-3 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
              {profile.plan.toUpperCase()}
            </span>
          )}
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Ekwipunek</h2>
          {userItems.length === 0 ? (
            <div className="glass-card rounded-xl p-6 text-center text-muted-foreground text-sm">
              Brak przedmiotów. Odwiedź sklep!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...equippedItems, ...unequippedItems].map((item) => (
                <div
                  key={item.id}
                  className={`glass-card rounded-lg p-4 border ${item.is_equipped ? "border-primary/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {item.items.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[item.items.rarity] || rarityColors.common}`}
                    >
                      {rarityLabels[item.items.rarity] || "Pospolity"}
                    </span>
                  </div>
                  {item.is_equipped && (
                    <p className="text-xs text-primary mt-1">Założony</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-bold text-lg mb-3">Odznaczenia</h2>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Brak odznaczeń. Kontynuuj grę!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span
                  key={a.achievement_id}
                  className="glass-card px-3 py-1.5 rounded-full text-sm"
                >
                  {ACHIEVEMENT_LABELS[a.achievement_id] || a.achievement_id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
