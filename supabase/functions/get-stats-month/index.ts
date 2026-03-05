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
    const { year, month } = await req.json();

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

    // Get month range
    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
    const daysInMonth = new Date(year, month, 0).getDate();

    // Get daily stats for this month
    const { data: monthlyDayStats } = await supabase
      .from("user_daily_stats")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", firstDay)
      .lte("date", lastDay)
      .order("date");

    // Create heatmap data
    const heatmap = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      const dateStr = date.toISOString().split("T")[0];
      const stat = monthlyDayStats?.find((d) => d.date === dateStr);
      return {
        day: i + 1,
        date: dateStr,
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          date.getDay()
        ],
        completedHabits: stat?.habits_completed || 0,
        totalHabits: stat?.habits_total || 0,
        percentComplete: stat?.completion_percent || 0,
        intensity: stat ? Math.floor(stat.completion_percent / 25) : 0, // 0-4
      };
    });

    // Get top 3 habits for the month
    const { data: allCompletions } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("user_id", user.id)
      .gte("completed_date", firstDay)
      .lte("completed_date", lastDay);

    const habitCounts: Record<string, number> = {};
    allCompletions?.forEach((c) => {
      habitCounts[c.habit_id] = (habitCounts[c.habit_id] || 0) + 1;
    });

    const topHabitIds = Object.entries(habitCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id);

    const { data: topHabits } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .in("id", topHabitIds);

    const top3Habits = topHabitIds
      .map((id) => {
        const habit = topHabits?.find((h) => h.id === id);
        const count = habitCounts[id];
        const totalHabits =
          monthlyDayStats?.reduce((sum, d) => sum + d.habits_total, 0) || 1;
        return {
          id,
          name: habit?.name || "Unknown",
          emoji: habit?.emoji || "✅",
          completions: count,
          percent: Math.round(
            (count / (daysInMonth * (totalHabits || 1))) * 100,
          ),
        };
      })
      .filter((h) => h);

    // Find worst habit
    const { data: allHabits } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .eq("user_id", user.id)
      .eq("archived", false);

    const worstHabit = allHabits?.reduce<any>((worst, habit) => {
      const count = habitCounts[habit.id] || 0;
      const worstCount = habitCounts[worst?.id] || Infinity;
      return count < worstCount ? habit : worst;
    }, null);

    // Calculate totals
    const totals = {
      completedHabits:
        monthlyDayStats?.reduce((sum, d) => sum + d.habits_completed, 0) || 0,
      completeDays:
        monthlyDayStats?.filter((d) => d.completion_percent === 100).length ||
        0,
      streakDays: 0, // Calculate separately
      coinsEarned:
        monthlyDayStats?.reduce((sum, d) => sum + d.coins_earned, 0) || 0,
      expEarned:
        monthlyDayStats?.reduce((sum, d) => sum + d.exp_earned, 0) || 0,
      lootBoxesOpened: 0,
    };

    const stats = {
      heatmap,
      top3Habits,
      worstHabit,
      totals,
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
