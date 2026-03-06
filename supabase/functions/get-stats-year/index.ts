import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { year } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    // Get all completions for the year
    const { data: completions } = await supabase
      .from("habit_completions")
      .select("id, habit_id, completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", yearStart)
      .lte("completed_date", yearEnd);

    // Get habits
    const { data: habits } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .eq("user_id", user.id)
      .eq("archived", false);

    const totalHabits = habits?.length || 1;

    // Group by date
    const countByDate: Record<string, number> = {};
    const habitCountMap: Record<string, number> = {};
    completions?.forEach(c => {
      countByDate[c.completed_date] = (countByDate[c.completed_date] || 0) + 1;
      habitCountMap[c.habit_id] = (habitCountMap[c.habit_id] || 0) + 1;
    });

    // Create heatmap (GitHub style)
    const heatmapData = [];
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const completed = countByDate[dateStr] || 0;
      const pct = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      heatmapData.push({
        date: dateStr,
        week: Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)),
        dayOfWeek: currentDate.getDay(),
        percentComplete: pct,
        intensity: Math.min(4, Math.floor(pct / 25)),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate longest streak
    const sortedDates = Object.keys(countByDate).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    for (const dateStr of sortedDates) {
      const d = new Date(dateStr);
      if (prevDate) {
        const diff = (d.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);
        if (diff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      prevDate = d;
    }

    // Best habit
    const bestEntry = Object.entries(habitCountMap).sort(([, a], [, b]) => b - a)[0];
    const bestHabitId = bestEntry?.[0];
    const bestHabit = habits?.find(h => h.id === bestHabitId) || null;

    // Tournament stats
    const { data: tournaments } = await supabase
      .from("tournament_history")
      .select("final_position")
      .eq("user_id", user.id)
      .gte("completed_at", yearStart)
      .lte("completed_at", yearEnd);

    const tournamentsCompleted = tournaments?.length || 0;
    const avgPosition = tournaments && tournaments.length > 0
      ? tournaments.reduce((s, t) => s + (t.final_position || 0), 0) / tournaments.length
      : null;

    // Items acquired
    const { data: items } = await supabase
      .from("user_items")
      .select("id")
      .eq("user_id", user.id)
      .gte("acquired_at", yearStart)
      .lte("acquired_at", yearEnd);

    const totalCompletions = completions?.length || 0;
    const totalDaysActive = Object.keys(countByDate).length;

    const stats = {
      heatmap: heatmapData,
      yearInNumbers: {
        totalCompletions,
        totalDaysActive,
        longestStreak,
        totalCoins: totalCompletions * 5,
        totalExp: totalCompletions * 10,
        favoriteHabit: bestHabit,
        favoriteHabitCompletions: bestEntry?.[1] || 0,
        tournamentsCompleted,
        avgTournamentPosition: avgPosition,
        itemsAcquired: items?.length || 0,
      },
      snapshot: null,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
