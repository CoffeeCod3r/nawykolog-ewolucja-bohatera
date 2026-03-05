import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HeatmapGrid, SimpleLineChart } from "./Charts";
import { YearlyStats } from "@/hooks/useStats";
import SharingCard from "./SharingCard";
import { AnimalType } from "@/lib/animalConfig";

interface StatsProps {
  stats: YearlyStats | null;
  loading: boolean;
  plan?: string;
  animalType?: string;
  animalStage?: number;
}

const StatsYear: React.FC<StatsProps> = ({
  stats,
  loading,
  plan = "pro",
  animalType = "wolf",
  animalStage = 1,
}) => {
  const sharingCardRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">Brak danych</div>
    );
  }

  const handleDownloadImage = async () => {
    try {
      // Dynamically import html2canvas only when needed
      const html2canvas = (await import("html2canvas")).default;

      if (sharingCardRef.current) {
        const canvas = await html2canvas(sharingCardRef.current, {
          backgroundColor: "#0F172A",
          scale: 2,
        });

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `nawykolog-${new Date().getFullYear()}.png`;
        link.click();
        toast.success("Obrazek pobrany!");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      toast.error(
        "Nie udało się pobrać obrazka. Upewnij się, że html2canvas jest zainstalowany.",
      );
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mój rok w Nawykologu",
          text: `Zrealizowałem ${stats.yearInNumbers.totalCompletions} nawyków w tym roku!`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link skopiowany!");
      }
    } catch (err) {
      if ((err as any).name !== "AbortError") {
        toast.error("Nie udało się udostępnić");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* GitHub-style Yearly Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="font-semibold mb-3">Twój rok 2026</h3>
          <div className="w-full overflow-x-auto pb-4">
            <motion.div
              className="inline-grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(52, 16px)`,
                gridAutoRows: "16px",
              }}
            >
              {stats.heatmap.map((item, idx) => {
                const colors = [
                  "bg-muted-foreground/10",
                  "bg-green-200 dark:bg-green-900/40",
                  "bg-green-400 dark:bg-green-700/60",
                  "bg-green-600 dark:bg-green-600",
                  "bg-green-800 dark:bg-green-500",
                ];

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    className={`${colors[item.intensity]} rounded cursor-pointer transition-colors border border-transparent hover:border-foreground/20`}
                    title={`${item.date}: ${item.percentComplete}%`}
                  />
                );
              })}
            </motion.div>
          </div>
          <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
            <span>Mniej</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded ${
                    i === 0
                      ? "bg-muted-foreground/10"
                      : i === 1
                        ? "bg-green-200 dark:bg-green-900/40"
                        : i === 2
                          ? "bg-green-400 dark:bg-green-700/60"
                          : i === 3
                            ? "bg-green-600 dark:bg-green-600"
                            : "bg-green-800 dark:bg-green-500"
                  }`}
                />
              ))}
            </div>
            <span>Więcej</span>
          </div>
        </div>
      </motion.div>

      {/* Year in Numbers - Spotify Wrapped style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        ref={sharingCardRef}
      >
        <SharingCard
          stats={stats}
          animalType={(animalType || "wolf") as AnimalType}
          animalStage={(animalStage || 1) as 1 | 2 | 3 | 4}
        />
      </motion.div>

      {/* Share Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="gaming"
          size="sm"
          onClick={handleDownloadImage}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Pobierz
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Udostępnij
        </Button>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            icon: "🎯",
            label: "Nawyki",
            value: stats.yearInNumbers.totalCompletions,
          },
          {
            icon: "📅",
            label: "Aktywne dni",
            value: stats.yearInNumbers.totalDaysActive,
          },
          {
            icon: "🔥",
            label: "Najdł. seria",
            value: `${stats.yearInNumbers.longestStreak} dni`,
          },
          {
            icon: "🪙",
            label: "Monety",
            value: stats.yearInNumbers.totalCoins,
          },
          {
            icon: "⚡",
            label: "EXP",
            value: stats.yearInNumbers.totalExp,
          },
          {
            icon: "🎁",
            label: "Itemów",
            value: stats.yearInNumbers.itemsAcquired,
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="glass-card rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
          >
            <span className="text-2xl block mb-1">{item.icon}</span>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Best Habit of the Year */}
      {stats.yearInNumbers.favoriteHabit && (
        <motion.div
          className="glass-card rounded-lg p-6 border-l-4 border-amber-500"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">👑</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-muted-foreground">
                Ulubiony nawyk roku
              </p>
              <p className="text-2xl font-bold">
                {stats.yearInNumbers.favoriteHabit.emoji}{" "}
                {stats.yearInNumbers.favoriteHabit.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Zrealizowany {stats.yearInNumbers.favoriteHabitCompletions} razy
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tournaments */}
      {stats.yearInNumbers.tournamentsCompleted > 0 && (
        <motion.div
          className="glass-card rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="font-semibold text-sm mb-2">🏆 Turnieje</p>
          <p className="text-lg font-bold">
            {stats.yearInNumbers.tournamentsCompleted}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Średnia pozycja:{" "}
            {stats.yearInNumbers.avgTournamentPosition
              ? `#${Math.round(stats.yearInNumbers.avgTournamentPosition)}`
              : "—"}
          </p>
        </motion.div>
      )}

      {/* PRO-only features note */}
      {plan === "plus" && (
        <motion.div
          className="glass-card rounded-lg p-4 bg-blue-500/10 border border-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-xs text-blue-600 dark:text-blue-400">
            ℹ️ Z planem PLUS widzisz ostatnie 3 miesiące. Uaktualnij do PRO, aby
            zobaczyć pełny rok!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StatsYear;
