import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get year range
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;

    // Get daily stats for the year
    const { data: yearlyDayStats } = await supabase
      .from("user_daily_stats")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", yearStart)
      .lte("date", yearEnd)
      .order("date");

    // Create heatmap data (GitHub style - 52 weeks x 7 days)
    const heatmapData = [];
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const stat = yearlyDayStats?.find((d) => d.date === dateStr);
      heatmapData.push({
        date: dateStr,
        week: Math.floor(
          (currentDate.getTime() - startDate.getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        ),
        dayOfWeek: currentDate.getDay(),
        percentComplete: stat?.completion_percent || 0,
        intensity: stat ? Math.floor(stat.completion_percent / 25) : 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get user profile for animal info
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get yearly snapshot data
    const { data: snapshot } = await supabase
      .from("yearly_snapshots")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", year)
      .single();

    // Calculate year in numbers
    const totalDaysActive =
      yearlyDayStats?.filter((d) => d.habits_completed > 0).length || 0;
    const totalCompletions =
      yearlyDayStats?.reduce((sum, d) => sum + d.habits_completed, 0) || 0;
    const totalCoins =
      yearlyDayStats?.reduce((sum, d) => sum + d.coins_earned, 0) || 0;
    const totalExp =
      yearlyDayStats?.reduce((sum, d) => sum + d.exp_earned, 0) || 0;

    // Get best habit of the year
    const { data: allCompletions } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("user_id", user.id)
      .gte("completed_date", yearStart)
      .lte("completed_date", yearEnd);

    const habitCounts: Record<string, number> = {};
    allCompletions?.forEach((c) => {
      habitCounts[c.habit_id] = (habitCounts[c.habit_id] || 0) + 1;
    });

    const bestHabitId = Object.entries(habitCounts).sort(
      ([, a], [, b]) => b - a,
    )[0]?.[0];
    const { data: bestHabit } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .eq("id", bestHabitId)
      .single();

    // Get tournament stats
    const { data: tournaments } = await supabase
      .from("tournament_history")
      .select("final_position")
      .eq("user_id", user.id)
      .gte("completed_at", yearStart)
      .lte("completed_at", yearEnd);

    const tournamentsCompleted = tournaments?.length || 0;
    const avgPosition =
      tournaments && tournaments.length > 0
        ? tournaments.reduce((sum, t) => sum + (t.final_position || 0), 0) /
          tournaments.length
        : null;

    // Get items acquired in this year
    const { data: itemsAcquired } = await supabase
      .from("user_items")
      .select("id")
      .eq("user_id", user.id)
      .gte("acquired_at", yearStart)
      .lte("acquired_at", yearEnd);

    const stats = {
      heatmap: heatmapData,
      yearInNumbers: {
        totalCompletions,
        totalDaysActive,
        longestStreak: profile?.streak_days || 0, // This should be calculated per year
        totalCoins,
        totalExp,
        favoriteHabit: bestHabit,
        favoriteHabitCompletions: habitCounts[bestHabitId || ""] || 0,
        tournamentsCompleted,
        avgTournamentPosition: avgPosition,
        itemsAcquired: itemsAcquired?.length || 0,
      },
      snapshot: snapshot || null,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
