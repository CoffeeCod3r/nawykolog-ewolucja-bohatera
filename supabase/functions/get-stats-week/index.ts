import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAY_NAMES = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];

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
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate Monday-based week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekDays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push(d.toISOString().split("T")[0]);
    }

    // Get completions for this week
    const { data: completions } = await supabase
      .from("habit_completions")
      .select("id, completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", weekDays[0])
      .lte("completed_date", weekDays[6]);

    // Get total habits count
    const { data: habits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", user.id)
      .eq("archived", false);

    const totalHabits = habits?.length || 0;

    // Group completions by date
    const countByDate: Record<string, number> = {};
    completions?.forEach(c => {
      countByDate[c.completed_date] = (countByDate[c.completed_date] || 0) + 1;
    });

    const week = weekDays.map(date => {
      const completed = countByDate[date] || 0;
      const pct = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      const d = new Date(date);
      return {
        date,
        dayOfWeek: DAY_NAMES[d.getDay()],
        completedHabits: completed,
        totalHabits,
        percentComplete: pct,
        coinsEarned: completed * 5,
        expEarned: completed * 10 + (pct === 100 && totalHabits > 0 ? 20 : 0),
      };
    });

    const totals = {
      totalCompletions: week.reduce((s, d) => s + d.completedHabits, 0),
      completeDays: week.filter(d => d.percentComplete === 100).length,
      totalCoins: week.reduce((s, d) => s + d.coinsEarned, 0),
      totalExp: week.reduce((s, d) => s + d.expEarned, 0),
    };

    const bestDay = week.reduce((best, day) =>
      day.percentComplete > best.percentComplete ? day : best, week[0]);

    // Previous week comparison
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(weekStart.getDate() - 1);

    const { data: prevCompletions } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("user_id", user.id)
      .gte("completed_date", prevWeekStart.toISOString().split("T")[0])
      .lte("completed_date", prevWeekEnd.toISOString().split("T")[0]);

    const prevTotal = prevCompletions?.length || 0;
    const diff = prevTotal > 0 ? Math.round(((totals.totalCompletions - prevTotal) / prevTotal) * 100) : 0;

    return new Response(JSON.stringify({
      week,
      totals,
      bestDay,
      previousWeekComparison: { percentDifference: diff, isImprovement: diff >= 0 },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
