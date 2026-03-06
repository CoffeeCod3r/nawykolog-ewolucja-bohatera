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

    const today = new Date().toISOString().split("T")[0];

    const [completionsRes, habitsRes, profileRes, lastCompletionRes] = await Promise.all([
      supabase.from("habit_completions").select("id, habit_id").eq("user_id", user.id).eq("completed_date", today),
      supabase.from("habits").select("id, name, emoji").eq("user_id", user.id).eq("archived", false),
      supabase.from("profiles").select("streak_days, exp, total_coins, weekly_coins").eq("id", user.id).single(),
      supabase.from("habit_completions").select("created_at").eq("user_id", user.id).eq("completed_date", today).order("created_at", { ascending: false }).limit(1),
    ]);

    const completedCount = completionsRes.data?.length || 0;
    const totalCount = habitsRes.data?.length || 0;
    const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Find which habit was completed most recently as "best habit"
    const completedHabitIds = new Set(completionsRes.data?.map(c => c.habit_id) || []);
    const bestHabit = habitsRes.data?.find(h => completedHabitIds.has(h.id)) || null;

    // Estimate coins/exp earned today: 10 exp per completion + 20 if all done
    const expEarned = completedCount * 10 + (completedCount >= totalCount && totalCount > 0 ? 20 : 0);
    const coinsEarned = completedCount * 5;

    const stats = {
      completedCount,
      totalCount,
      percentComplete,
      streakDays: profileRes.data?.streak_days || 0,
      coinsEarned,
      expEarned,
      bestHabit,
      lastLoginTime: lastCompletionRes.data?.[0]?.created_at || null,
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
