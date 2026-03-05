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

    // Calculate week dates
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push(date.toISOString().split("T")[0]);
    }

    // Get daily stats for each day
    const { data: dailyStats } = await supabase
      .from("user_daily_stats")
      .select("*")
      .eq("user_id", user.id)
      .in("date", weekDays)
      .order("date");

    // Create data for each day (fill in missing days with 0s)
    const week = weekDays.map((date) => {
      const stat = dailyStats?.find((d) => d.date === date);
      return {
        date,
        dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          new Date(date).getDay()
        ],
        completedHabits: stat?.habits_completed || 0,
        totalHabits: stat?.habits_total || 0,
        percentComplete: stat?.completion_percent || 0,
        coinsEarned: stat?.coins_earned || 0,
        expEarned: stat?.exp_earned || 0,
      };
    });

    // Calculate totals
    const totals = {
      totalCompletions: week.reduce((sum, day) => sum + day.completedHabits, 0),
      completeDays: week.filter((day) => day.percentComplete === 100).length,
      totalCoins: week.reduce((sum, day) => sum + day.coinsEarned, 0),
      totalExp: week.reduce((sum, day) => sum + day.expEarned, 0),
    };

    // Find best day
    const bestDay = week.reduce(
      (best, day) => (day.percentComplete > best.percentComplete ? day : best),
      week[0] || {},
    );

    // Compare with previous week
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);

    const prevWeekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(prevWeekStart);
      date.setDate(prevWeekStart.getDate() + i);
      prevWeekDays.push(date.toISOString().split("T")[0]);
    }

    const { data: prevDailyStats } = await supabase
      .from("user_daily_stats")
      .select("*")
      .eq("user_id", user.id)
      .in("date", prevWeekDays);

    const prevTotals = {
      totalCompletions:
        prevDailyStats?.reduce((sum, d) => sum + d.habits_completed, 0) || 0,
    };

    const completionDifference =
      prevTotals.totalCompletions > 0
        ? Math.round(
            ((totals.totalCompletions - prevTotals.totalCompletions) /
              prevTotals.totalCompletions) *
              100,
          )
        : 0;

    const stats = {
      week,
      totals,
      bestDay,
      previousWeekComparison: {
        percentDifference: completionDifference,
        isImprovement: completionDifference >= 0,
      },
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
