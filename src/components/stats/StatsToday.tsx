import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DonutChart, ProgressRing } from "./Charts";
import { DailyStats } from "@/hooks/useStats";

interface StatsProps {
  stats: DailyStats | null;
  loading: boolean;
}

const StatsToday: React.FC<StatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">Brak danych</div>
    );
  }

  // Color for animated flame based on streak
  const flameColor = stats.streakDays >= 7 ? "#ef4444" : "#fbbf24";

  return (
    <div className="space-y-6">
      {/* Progress Donut + Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <DonutChart
              completed={stats.completedCount}
              total={stats.totalCount}
              size="lg"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Progres dzisiaj
            </p>
          </div>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          className="flex flex-col items-center justify-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative">
            <motion.div
              animate={stats.streakDays >= 7 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-6xl"
            >
              🔥
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{stats.streakDays}</p>
            <p className="text-sm text-muted-foreground">dni bez przerwy</p>
            {stats.streakDays >= 7 && (
              <p className="text-xs text-amber-500 mt-2">
                🎉 Niesamowita seria!
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {/* Coins Earned */}
        <motion.div
          className="glass-card rounded-lg p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-3xl mb-2">🪙</div>
          <p className="text-xl font-bold">{stats.coinsEarned}</p>
          <p className="text-xs text-muted-foreground">Monety zdobyte</p>
        </motion.div>

        {/* EXP Earned */}
        <motion.div
          className="glass-card rounded-lg p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-3xl mb-2">⚡</div>
          <p className="text-xl font-bold">{stats.expEarned}</p>
          <p className="text-xs text-muted-foreground">EXP do ewolucji</p>
        </motion.div>
      </div>

      {/* Best Habit Today */}
      {stats.bestHabit && (
        <motion.div
          className="glass-card rounded-lg p-4 border-l-4 border-amber-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⭐</span>
            <p className="font-semibold text-sm">Najlepszy nawyk dzisiaj</p>
          </div>
          <p className="text-lg font-bold">{stats.bestHabit.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Seria: {stats.bestHabit.streak || 1} dni
          </p>
        </motion.div>
      )}

      {/* Last Login Time */}
      {stats.lastLoginTime && (
        <motion.div
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>
            Ostatni zapis:{" "}
            {new Date(stats.lastLoginTime).toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StatsToday;
