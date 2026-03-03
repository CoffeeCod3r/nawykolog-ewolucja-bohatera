import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action } = await req.json();

    if (action === "create") {
      return await createTournaments(supabase);
    } else if (action === "close") {
      return await closeTournaments(supabase);
    } else if (action === "fox_steal") {
      return await foxSteal(supabase);
    } else if (action === "dragon_decrement") {
      await supabase.rpc("decrement_dragon_bonus" as any);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createTournaments(supabase: any) {
  // Get users without active tournament
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, exp, current_tournament_id")
    .is("current_tournament_id", null);

  if (!allProfiles || allProfiles.length === 0) {
    return jsonResponse({ message: "No users to assign", created: 0 });
  }

  // Group by EXP brackets
  const brackets: Record<string, any[]> = {
    "0-500": [],
    "500-2000": [],
    "2000-6000": [],
    "6000+": [],
  };
  const bracketRanges = [
    { key: "0-500", min: 0, max: 500 },
    { key: "500-2000", min: 500, max: 2000 },
    { key: "2000-6000", min: 2000, max: 6000 },
    { key: "6000+", min: 6000, max: 999999 },
  ];

  for (const p of allProfiles) {
    const br = bracketRanges.find((b) => p.exp >= b.min && p.exp < b.max);
    if (br) brackets[br.key].push(p);
  }

  let created = 0;

  for (const [key, users] of Object.entries(brackets)) {
    // Shuffle
    const shuffled = users.sort(() => Math.random() - 0.5);
    const range = bracketRanges.find((b) => b.key === key)!;

    // Create groups of 10 (or smaller if not enough)
    for (let i = 0; i < shuffled.length; i += 10) {
      const group = shuffled.slice(i, i + 10);
      if (group.length < 2) continue; // Need at least 2

      // Create tournament
      const { data: tournament, error: tErr } = await supabase
        .from("tournaments")
        .insert({
          min_exp: range.min,
          max_exp: range.max,
          status: "active",
        })
        .select()
        .single();

      if (tErr || !tournament) continue;

      // Add participants
      const participants = group.map((u: any) => ({
        tournament_id: tournament.id,
        user_id: u.id,
        masked_position: false, // Will set for panthers below
      }));

      await supabase.from("tournament_participants").insert(participants);

      // Set masked_position for panthers
      const pantherIds = [];
      for (const u of group) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("animal_type")
          .eq("id", u.id)
          .single();
        if (profile?.animal_type === "panther") {
          pantherIds.push(u.id);
        }
      }
      if (pantherIds.length > 0) {
        await supabase
          .from("tournament_participants")
          .update({ masked_position: true })
          .eq("tournament_id", tournament.id)
          .in("user_id", pantherIds);
      }

      // Update users' current_tournament_id
      for (const u of group) {
        await supabase
          .from("profiles")
          .update({ current_tournament_id: tournament.id })
          .eq("id", u.id);
      }

      created++;
    }
  }

  return jsonResponse({ message: "Tournaments created", created });
}

async function closeTournaments(supabase: any) {
  // Find expired active tournaments
  const { data: expired } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active")
    .lt("end_date", new Date().toISOString());

  if (!expired || expired.length === 0) {
    return jsonResponse({ message: "No tournaments to close", closed: 0 });
  }

  const rewards = [
    { pos: 1, coins: 500, exp: 200 },
    { pos: 2, coins: 350, exp: 150 },
    { pos: 3, coins: 250, exp: 100 },
    { pos: 4, coins: 150, exp: 75 },
    { pos: 5, coins: 100, exp: 50 },
    { pos: 6, coins: 75, exp: 40 },
    { pos: 7, coins: 50, exp: 30 },
    { pos: 8, coins: 40, exp: 20 },
    { pos: 9, coins: 30, exp: 15 },
    { pos: 10, coins: 20, exp: 10 },
  ];

  for (const t of expired) {
    // Get participants sorted by coins
    const { data: participants } = await supabase
      .from("tournament_participants")
      .select("*")
      .eq("tournament_id", t.id)
      .order("coins_earned", { ascending: false });

    if (!participants) continue;

    // Assign rewards
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const reward = rewards[i] || { pos: i + 1, coins: 10, exp: 5 };

      // Update final position
      await supabase
        .from("tournament_participants")
        .update({ final_position: i + 1 })
        .eq("id", p.id);

      // Award coins and EXP
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_coins, exp")
        .eq("id", p.user_id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({
            total_coins: profile.total_coins + reward.coins,
            exp: profile.exp + reward.exp,
            current_tournament_id: null,
          })
          .eq("id", p.user_id);
      }

      // Save history
      await supabase.from("tournament_history").insert({
        user_id: p.user_id,
        tournament_id: t.id,
        final_position: i + 1,
        coins_earned: p.coins_earned,
        coin_reward: reward.coins,
        exp_reward: reward.exp,
      });
    }

    // Close tournament
    await supabase
      .from("tournaments")
      .update({ status: "completed" })
      .eq("id", t.id);
  }

  return jsonResponse({ message: "Tournaments closed", closed: expired.length });
}

async function foxSteal(supabase: any) {
  // Get all active tournaments
  const { data: activeTournaments } = await supabase
    .from("tournaments")
    .select("id")
    .eq("status", "active");

  if (!activeTournaments) return jsonResponse({ message: "No active tournaments" });

  let steals = 0;

  for (const t of activeTournaments) {
    const { data: participants } = await supabase
      .from("tournament_participants")
      .select("*, profiles(animal_type)")
      .eq("tournament_id", t.id)
      .order("coins_earned", { ascending: false });

    if (!participants) continue;

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (p.profiles?.animal_type !== "fox" || i === 0) continue;

      // Steal 10 from player above
      const target = participants[i - 1];
      const stealAmount = Math.min(10, target.coins_earned);

      await supabase
        .from("tournament_participants")
        .update({ coins_earned: p.coins_earned + stealAmount })
        .eq("id", p.id);

      await supabase
        .from("tournament_participants")
        .update({ coins_earned: target.coins_earned - stealAmount })
        .eq("id", target.id);

      steals++;
    }
  }

  return jsonResponse({ message: "Fox steals done", steals });
}

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
  });
}
