import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;

    const { habitId } = await req.json();
    if (!habitId) {
      return new Response(JSON.stringify({ error: "habitId required" }), { status: 400, headers: corsHeaders });
    }

    // Use service role for all mutations
    const admin = createClient(supabaseUrl, serviceKey);
    const today = new Date().toISOString().split("T")[0];

    // Verify habit belongs to user
    const { data: habit, error: habitErr } = await admin
      .from("habits")
      .select("id, user_id")
      .eq("id", habitId)
      .eq("user_id", userId)
      .single();

    if (habitErr || !habit) {
      return new Response(JSON.stringify({ error: "Nawyk nie znaleziony" }), { status: 404, headers: corsHeaders });
    }

    // Check if already completed today
    const { data: existing } = await admin
      .from("habit_completions")
      .select("id")
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .eq("completed_date", today)
      .maybeSingle();

    let action: "completed" | "uncompleted";

    if (existing) {
      // Uncomplete - delete the completion
      await admin.from("habit_completions").delete().eq("id", existing.id);
      action = "uncompleted";
    } else {
      // Complete - insert (the trigger handles coin calculation)
      const { error: insertErr } = await admin
        .from("habit_completions")
        .insert({ habit_id: habitId, user_id: userId, completed_date: today });
      if (insertErr) {
        return new Response(JSON.stringify({ error: "Nie udało się zapisać nawyku" }), { status: 500, headers: corsHeaders });
      }
      action = "completed";
    }

    // Now handle EXP, streak, evolution (server-side only)
    const { data: profile } = await admin
      .from("profiles")
      .select("exp, streak_days, last_active_date, animal_stage, animal_type")
      .eq("id", userId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profil nie znaleziony" }), { status: 404, headers: corsHeaders });
    }

    // Count today's completions and total habits
    const [completionsRes, habitsRes] = await Promise.all([
      admin.from("habit_completions").select("id").eq("user_id", userId).eq("completed_date", today),
      admin.from("habits").select("id").eq("user_id", userId).eq("archived", false),
    ]);

    const todayCount = completionsRes.data?.length || 0;
    const totalHabits = habitsRes.data?.length || 0;
    const allDone = todayCount >= totalHabits && totalHabits > 0;

    // Calculate EXP change
    let expDelta = 0;
    if (action === "completed") {
      expDelta = 10; // +10 per habit
      if (allDone) expDelta += 20; // +20 for complete day
    } else {
      expDelta = -10; // Remove EXP for uncompleted
      // If was allDone before uncomplete (todayCount is already decremented), remove bonus
      if (todayCount + 1 >= totalHabits && totalHabits > 0) {
        expDelta -= 20;
      }
    }

    const newExp = Math.max(0, profile.exp + expDelta);

    // Calculate streak
    let newStreak = profile.streak_days;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (action === "completed" && todayCount === 1) {
      // First completion today - update streak
      if (profile.last_active_date === yesterdayStr) {
        newStreak = profile.streak_days + 1;
      } else if (profile.last_active_date !== today) {
        newStreak = 1;
      }
    }

    // Check evolution
    let newStage = profile.animal_stage;
    if (newExp >= 6000) newStage = 4;
    else if (newExp >= 2000) newStage = 3;
    else if (newExp >= 500) newStage = 2;
    else newStage = 1;

    const evolved = newStage > profile.animal_stage;

    // Update profile
    await admin
      .from("profiles")
      .update({
        exp: newExp,
        streak_days: newStreak,
        last_active_date: today,
        animal_stage: newStage,
      })
      .eq("id", userId);

    // Check achievements
    const newAchievements: string[] = [];
    if (action === "completed") {
      // First completion ever
      const { count } = await admin
        .from("habit_completions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count === 1) newAchievements.push("first_completion");
      if (newStreak >= 7) newAchievements.push("streak_7");
      if (newStreak >= 30) newAchievements.push("streak_30");
      if (newStreak >= 100) newAchievements.push("streak_100");
      if (newStreak >= 365) newAchievements.push("streak_365");

      // Insert achievements (ignore duplicates)
      for (const achId of newAchievements) {
        const { data: existingAch } = await admin
          .from("user_achievements")
          .select("id")
          .eq("user_id", userId)
          .eq("achievement_id", achId)
          .maybeSingle();

        if (!existingAch) {
          await admin.from("user_achievements").insert({
            user_id: userId,
            achievement_id: achId,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        action,
        todayCount,
        totalHabits,
        allDone,
        exp: newExp,
        streakDays: newStreak,
        animalStage: newStage,
        evolved,
        newAchievements,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Wystąpił błąd serwera" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
