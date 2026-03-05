import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, RefreshCw, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  useStatsDaily,
  useStatsWeekly,
  useStatsMonthly,
  useStatsYearly,
} from "@/hooks/useStats";
import { useAuth } from "@/hooks/useAuth";
import {
  DonutChart,
  SimpleBarChart,
  HeatmapGrid,
  SimpleLineChart,
  ProgressRing,
} from "./Charts";
import { CACHE_DURATION } from "@/lib/stats-cache";
import StatsToday from "./StatsToday";
import StatsWeek from "./StatsWeek";
import StatsMonth from "./StatsMonth";
import StatsYear from "./StatsYear";

export const StatsWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState("today");
  const { profile } = useAuth();
  const dailyStats = useStatsDaily();
  const weeklyStats = useStatsWeekly();
  const monthlyStats = useStatsMonthly();
  const yearlyStats = useStatsYearly();

  const handleRefresh = (tab: string) => {
    switch (tab) {
      case "today":
        dailyStats.refetch();
        break;
      case "week":
        weeklyStats.refetch(true);
        break;
      case "month":
        monthlyStats.refetch(true);
        break;
      case "year":
        yearlyStats.refetch(true);
        break;
    }
    toast.success("Statystyki odświeżone!");
  };

  const isCacheOld = (cacheAge: number) => {
    return cacheAge > 2 * 60 * 60 * 1000; // 2 hours
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Twoje Statystyki</h2>
        {activeTab !== "today" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefresh(activeTab)}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Odśwież
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-2">
          <TabsTrigger value="today">Dzisiaj</TabsTrigger>
          <TabsTrigger value="week">Tydzień</TabsTrigger>
          <TabsTrigger value="month" disabled={profile?.plan === "free"}>
            Miesiąc
            {profile?.plan === "free" && (
              <span className="text-xs ml-1">+</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="year" disabled={profile?.plan === "free"}>
            Rok
            {profile?.plan === "free" && (
              <span className="text-xs ml-1">PRO</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Today */}
        <TabsContent value="today" className="mt-6">
          <StatsToday stats={dailyStats.stats} loading={dailyStats.loading} />
        </TabsContent>

        {/* Tab: Week */}
        <TabsContent value="week" className="mt-6">
          <StatsWeek stats={weeklyStats.stats} loading={weeklyStats.loading} />
        </TabsContent>

        {/* Tab: Month */}
        <TabsContent value="month" className="mt-6">
          {profile?.plan === "free" ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Miej dostęp do statystyk miesiąca z planem PLUS lub PRO
              </p>
              <Button variant="gaming">Uaktualnij plan</Button>
            </div>
          ) : (
            <StatsMonth
              stats={monthlyStats.stats}
              loading={monthlyStats.loading}
            />
          )}
        </TabsContent>

        {/* Tab: Year */}
        <TabsContent value="year" className="mt-6">
          {profile?.plan === "free" ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Pełny rok dostępny tylko w planie PRO
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Z planem PLUS widzisz ostatnie 3 miesiące
              </p>
              <Button variant="gaming">Uaktualnij na PRO</Button>
            </div>
          ) : (
            <StatsYear
              stats={yearlyStats.stats}
              loading={yearlyStats.loading}
              plan={profile?.plan}
              animalType={profile?.animal_type}
              animalStage={profile?.animal_stage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsWidget;
