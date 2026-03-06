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
    const { year, month } = await req.json();

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

    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const daysInMonth = new Date(year, month, 0).getDate();
    const lastDay = new Date(year, month - 1, daysInMonth).toISOString().split("T")[0];

    // Get all completions this month
    const { data: completions } = await supabase
      .from("habit_completions")
      .select("id, habit_id, completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", firstDay)
      .lte("completed_date", lastDay);

    // Get habits
    const { data: habits } = await supabase
      .from("habits")
      .select("id, name, emoji")
      .eq("user_id", user.id)
      .eq("archived", false);

    const totalHabits = habits?.length || 0;

    // Group by date
    const countByDate: Record<string, number> = {};
    const habitCountMap: Record<string, number> = {};
    completions?.forEach(c => {
      countByDate[c.completed_date] = (countByDate[c.completed_date] || 0) + 1;
      habitCountMap[c.habit_id] = (habitCountMap[c.habit_id] || 0) + 1;
    });

    // Heatmap
    const heatmap = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      const dateStr = date.toISOString().split("T")[0];
      const completed = countByDate[dateStr] || 0;
      const pct = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      return {
        day: i + 1,
        date: dateStr,
        dayOfWeek: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"][date.getDay()],
        completedHabits: completed,
        totalHabits,
        percentComplete: pct,
        intensity: Math.min(3, Math.floor(pct / 34)),
      };
    });

    // Top 3 habits
    const sortedHabits = Object.entries(habitCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const top3Habits = sortedHabits.map(([id, count]) => {
      const habit = habits?.find(h => h.id === id);
      return {
        id,
        name: habit?.name || "?",
        emoji: habit?.emoji || "✅",
        completions: count,
        percent: Math.round((count / daysInMonth) * 100),
      };
    });

    // Worst habit
    let worstHabit = null;
    if (habits && habits.length > 0) {
      const worst = habits.reduce((w, h) => {
        const c = habitCountMap[h.id] || 0;
        const wc = habitCountMap[w.id] || 0;
        return c < wc ? h : w;
      });
      if ((habitCountMap[worst.id] || 0) < daysInMonth * 0.5) {
        worstHabit = worst;
      }
    }

    const totalCompletions = completions?.length || 0;
    const completeDays = heatmap.filter(d => d.percentComplete === 100).length;

    const stats = {
      heatmap,
      top3Habits,
      worstHabit,
      totals: {
        completedHabits: totalCompletions,
        completeDays,
        streakDays: completeDays,
        coinsEarned: totalCompletions * 5,
        expEarned: totalCompletions * 10 + completeDays * 20,
        lootBoxesOpened: 0,
      },
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
