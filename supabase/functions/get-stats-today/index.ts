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

    // Get today's stats
    const today = new Date().toISOString().split("T")[0];

    // Count completed habits today
    const { data: todaysCompletions } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("completed_date", today);

    // Count total habits
    const { data: allHabits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", user.id)
      .eq("archived", false);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get last login time (from completions)
    const { data: lastCompletion } = await supabase
      .from("habit_completions")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("completed_date", today)
      .order("created_at", { ascending: false })
      .limit(1);

    const completedCount = todaysCompletions?.length || 0;
    const totalCount = allHabits?.length || 0;
    const percentComplete =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Get best habit today (longest streak)
    const { data: habitStreaks } = await supabase
      .rpc("get_habit_streaks", { p_user_id: user.id })
      .limit(1);

    const bestHabit = habitStreaks?.length > 0 ? habitStreaks[0] : null;

    const stats = {
      today: {
        completedCount,
        totalCount,
        percentComplete,
        streakDays: profile?.streak_days || 0,
        coinsEarned: 0, // Will be calculated from daily log
        expEarned: 0, // Will be calculated from daily log
        bestHabit,
        lastLoginTime: lastCompletion?.[0]?.created_at || null,
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
