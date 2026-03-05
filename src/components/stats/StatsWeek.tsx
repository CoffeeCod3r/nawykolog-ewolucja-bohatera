import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapGrid, SimpleBarChart } from "./Charts";
import { WeeklyStats } from "@/hooks/useStats";

interface StatsProps {
  stats: WeeklyStats | null;
  loading: boolean;
}

const StatsWeek: React.FC<StatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">Brak danych</div>
    );
  }

  // Prepare bar chart data
  const barData = stats.week.map((day) => ({
    label: day.dayOfWeek.slice(0, 1).toUpperCase(),
    value: day.completedHabits,
    color: day.percentComplete === 100 ? "#22c55e" : "#f97316",
  }));

  // Get comparison indicator
  const comparisonIcon = stats.previousWeekComparison.isImprovement ? (
    <ArrowUp className="w-4 h-4 text-green-500" />
  ) : (
    <ArrowDown className="w-4 h-4 text-red-500" />
  );

  const comparisonColor = stats.previousWeekComparison.isImprovement
    ? "text-green-500"
    : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Heatmap - 7 dni */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h3 className="font-semibold mb-3">Przebieg tygodnia</h3>
          <div className="flex gap-2">
            {stats.week.map((day, idx) => {
              const colors = [
                "bg-gray-200 dark:bg-gray-700",
                "bg-green-200 dark:bg-green-900/40",
                "bg-green-400 dark:bg-green-700/60",
                "bg-green-600 dark:bg-green-600",
              ];
              const colorIdx =
                day.percentComplete === 0
                  ? 0
                  : day.percentComplete < 50
                    ? 1
                    : day.percentComplete < 100
                      ? 2
                      : 3;

              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  className={`flex-1 aspect-square rounded ${colors[colorIdx]} flex items-center justify-center cursor-pointer transition-all relative group`}
                  title={`${day.dayOfWeek}: ${day.percentComplete}%`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.percentComplete}%
                  </div>
                  <span className="text-xs font-bold text-foreground/60">
                    {day.dayOfWeek.slice(0, 1)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SimpleBarChart
          data={barData}
          title="Ukończone nawyki dziennie"
          height={150}
        />
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Razem nawyków", value: stats.totals.totalCompletions },
          { label: "Kompletne dni", value: `${stats.totals.completeDays}/7` },
          { label: "Monety", value: stats.totals.totalCoins },
          { label: "EXP", value: stats.totals.totalExp },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="glass-card rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + idx * 0.05 }}
          >
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Best Day */}
      {stats.bestDay && (
        <motion.div
          className="glass-card rounded-lg p-4 border-l-4 border-amber-500"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <p className="font-semibold text-sm">Najlepszy dzień w tygodniu</p>
          </div>
          <p className="text-lg font-bold">{stats.bestDay.dayOfWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.bestDay.percentComplete}% realizacji
          </p>
        </motion.div>
      )}

      {/* Week Comparison */}
      <motion.div
        className="glass-card rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {comparisonIcon}
            <span className={`font-bold ${comparisonColor}`}>
              {Math.abs(stats.previousWeekComparison.percentDifference)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            wobec poprzedniego tygodnia
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsWeek;
