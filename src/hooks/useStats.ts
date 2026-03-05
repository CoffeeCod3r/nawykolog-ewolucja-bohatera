import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getCachedStats,
  setCachedStats,
  STATS_CACHE_KEYS,
  CACHE_DURATION,
} from "@/lib/stats-cache";

export interface DailyStats {
  completedCount: number;
  totalCount: number;
  percentComplete: number;
  streakDays: number;
  coinsEarned: number;
  expEarned: number;
  bestHabit: any | null;
  lastLoginTime: string | null;
}

export interface WeeklyStats {
  week: Array<{
    date: string;
    dayOfWeek: string;
    completedHabits: number;
    totalHabits: number;
    percentComplete: number;
    coinsEarned: number;
    expEarned: number;
  }>;
  totals: {
    totalCompletions: number;
    completeDays: number;
    totalCoins: number;
    totalExp: number;
  };
  bestDay: any;
  previousWeekComparison: {
    percentDifference: number;
    isImprovement: boolean;
  };
}

export interface MonthlyStats {
  heatmap: Array<{
    day: number;
    date: string;
    dayOfWeek: string;
    completedHabits: number;
    totalHabits: number;
    percentComplete: number;
    intensity: number;
  }>;
  top3Habits: Array<{
    id: string;
    name: string;
    emoji: string;
    completions: number;
    percent: number;
  }>;
  worstHabit: any;
  totals: {
    completedHabits: number;
    completeDays: number;
    streakDays: number;
    coinsEarned: number;
    expEarned: number;
    lootBoxesOpened: number;
  };
}

export interface YearlyStats {
  heatmap: Array<{
    date: string;
    week: number;
    dayOfWeek: number;
    percentComplete: number;
    intensity: number;
  }>;
  yearInNumbers: {
    totalCompletions: number;
    totalDaysActive: number;
    longestStreak: number;
    totalCoins: number;
    totalExp: number;
    favoriteHabit: any;
    favoriteHabitCompletions: number;
    tournamentsCompleted: number;
    avgTournamentPosition: number | null;
    itemsAcquired: number;
  };
  snapshot: any;
}

export const useStatsDaily = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } =
        await supabase.functions.invoke("get-stats-today");

      if (err) {
        console.warn(
          "Function not available, falling back to client-side calculation:",
          err,
        );
        // Fallback to client-side calculation
        await fetchStatsClientSide();
        return;
      }
      setStats(data);
      setError(null);
    } catch (err) {
      console.warn(
        "Function error, falling back to client-side calculation:",
        err,
      );
      // Fallback to client-side calculation
      await fetchStatsClientSide();
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatsClientSide = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Count completed habits today
      const { data: todaysCompletions, error: compError } = await supabase
        .from("habit_completions")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("completed_date", today);

      if (compError) throw compError;

      // Count total habits
      const { data: allHabits, error: habitError } = await supabase
        .from("habits")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .eq("archived", false);

      if (habitError) throw habitError;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const completedCount = todaysCompletions?.length || 0;
      const totalCount = allHabits?.length || 0;
      const percentComplete =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const stats = {
        today: {
          completedCount,
          totalCount,
          percentComplete,
          streakDays: profile?.streak_days || 0,
          coinsEarned: 0, // Will be calculated later
          expEarned: 0, // Will be calculated later
          bestHabit: null, // Will be calculated later
          lastLoginTime: null,
        },
      };

      setStats(stats.today);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useStatsWeekly = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number>(0);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const week = Math.ceil(
        (today.getDate() + new Date(year, 0, 1).getDay()) / 7,
      );
      const cacheKey = STATS_CACHE_KEYS.WEEK(year, week);

      if (!forceRefresh) {
        const cached = getCachedStats<WeeklyStats>(cacheKey);
        if (cached) {
          setStats(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const { data, error: err } =
        await supabase.functions.invoke("get-stats-week");

      if (err) throw err;
      setStats(data);
      setCachedStats(cacheKey, data);
      setCacheAge(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, cacheAge, refetch: fetchStats };
};

export const useStatsMonthly = (year?: number, month?: number) => {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number>(0);

  const fetchStats = useCallback(
    async (forceRefresh = false) => {
      try {
        const date = new Date();
        const targetYear = year || date.getFullYear();
        const targetMonth = month || date.getMonth() + 1;
        const cacheKey = STATS_CACHE_KEYS.MONTH(targetYear, targetMonth);

        if (!forceRefresh) {
          const cached = getCachedStats<MonthlyStats>(cacheKey);
          if (cached) {
            setStats(cached);
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        const { data, error: err } = await supabase.functions.invoke(
          "get-stats-month",
          {
            body: { year: targetYear, month: targetMonth },
          },
        );

        if (err) throw err;
        setStats(data);
        setCachedStats(cacheKey, data);
        setCacheAge(0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    },
    [year, month],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, cacheAge, refetch: fetchStats };
};

export const useStatsYearly = (year?: number) => {
  const [stats, setStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<number>(0);

  const fetchStats = useCallback(
    async (forceRefresh = false) => {
      try {
        const targetYear = year || new Date().getFullYear();
        const cacheKey = STATS_CACHE_KEYS.YEAR(targetYear);

        if (!forceRefresh) {
          const cached = getCachedStats<YearlyStats>(cacheKey);
          if (cached) {
            setStats(cached);
            setLoading(false);
            return;
          }
        }

        setLoading(true);
        const { data, error: err } = await supabase.functions.invoke(
          "get-stats-year",
          {
            body: { year: targetYear },
          },
        );

        if (err) throw err;
        setStats(data);
        setCachedStats(cacheKey, data);
        setCacheAge(0);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    },
    [year],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, cacheAge, refetch: fetchStats };
};
