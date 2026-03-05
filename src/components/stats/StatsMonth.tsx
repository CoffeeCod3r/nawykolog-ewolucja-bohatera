import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapGrid } from "./Charts";
import { MonthlyStats } from "@/hooks/useStats";

interface StatsProps {
  stats: MonthlyStats | null;
  loading: boolean;
}

const StatsMonth: React.FC<StatsProps> = ({ stats, loading }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">Brak danych</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heatmap - Całe miesiąc */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="font-semibold mb-3">Kalendarz miesiąca</h3>
          <div className="grid grid-cols-7 gap-1 max-w-2xl">
            {/* Day headers */}
            {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "N"].map((day) => (
              <div
                key={day}
                className="h-8 flex items-center justify-center text-xs font-bold"
              >
                {day}
              </div>
            ))}

            {/* Calendar cells */}
            {stats.heatmap.map((item, idx) => {
              const dayOfWeek = new Date(item.date).getDay();
              const isFirstWeek = item.day <= 7;

              const colors = [
                "bg-gray-200 dark:bg-gray-700",
                "bg-green-200 dark:bg-green-900/40",
                "bg-green-400 dark:bg-green-700/60",
                "bg-green-600 dark:bg-green-600",
              ];

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDay(item.date)}
                  className={`h-12 rounded flex items-center justify-center cursor-pointer transition-all relative group ${
                    colors[item.intensity]
                  } ${selectedDay === item.date ? "ring-2 ring-primary" : ""}`}
                  title={`${item.date}: ${item.percentComplete}%`}
                >
                  <span className="text-xs font-bold">{item.day}</span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {item.completedHabits}/{item.totalHabits}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Ukończone", value: stats.totals.completedHabits },
          { label: "Kompletne dni", value: stats.totals.completeDays },
          { label: "Monety", value: stats.totals.coinsEarned },
          { label: "EXP", value: stats.totals.expEarned },
          { label: "Skrzynki", value: stats.totals.lootBoxesOpened },
          {
            label: "Najdłuższa seria",
            value: `${stats.totals.streakDays} dni`,
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="glass-card rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
          >
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Top 3 Habits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="font-semibold mb-3">Top 3 nawyki miesiąca</h3>
        <div className="space-y-3">
          {stats.top3Habits.slice(0, 3).map((habit, idx) => (
            <div
              key={habit.id}
              className="glass-card rounded-lg p-4 flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {habit.emoji} {habit.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {habit.percent}% realizacji
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{habit.completions}</p>
                <p className="text-xs text-muted-foreground">ukończeń</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Worst Habit */}
      {stats.worstHabit && (
        <motion.div
          className="glass-card rounded-lg p-4 border-l-4 border-red-500"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-start gap-3 mb-2">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Potrzebuje uwagi</p>
              <p className="text-lg font-bold">
                {stats.worstHabit.emoji} {stats.worstHabit.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Rozważ zmianę godziny przypomnienia
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <span>0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900/40 rounded"></div>
          <span>1-49%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 dark:bg-green-700/60 rounded"></div>
          <span>50-99%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 dark:bg-green-600 rounded"></div>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsMonth;
