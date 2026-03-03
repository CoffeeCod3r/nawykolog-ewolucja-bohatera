import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { boxId } = await req.json();

    // Get loot box
    const { data: box, error: boxError } = await supabase
      .from("loot_boxes")
      .select("*")
      .eq("id", boxId)
      .single();
    if (boxError || !box) {
      return new Response(JSON.stringify({ error: "Loot box not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_coins, animal_type")
      .eq("id", user.id)
      .single();
    if (!profile || profile.total_coins < box.coin_price) {
      return new Response(JSON.stringify({ error: "Not enough coins" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine rarity
    const roll = Math.random();
    let rarity = box.guaranteed_rarity;
    if (box.bonus_rarity && box.bonus_chance && roll < box.bonus_chance) {
      rarity = box.bonus_rarity;
    }

    // Get matching items (animal-specific or global)
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .eq("rarity", rarity)
      .or(`animal_type.eq.${profile.animal_type},animal_type.is.null`);

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items available" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick random item
    const wonItem = items[Math.floor(Math.random() * items.length)];

    // Deduct coins
    await supabase
      .from("profiles")
      .update({ total_coins: profile.total_coins - box.coin_price })
      .eq("id", user.id);

    // Add item to user
    await supabase.from("user_items").insert({
      user_id: user.id,
      item_id: wonItem.id,
    });

    return new Response(
      JSON.stringify({ item: wonItem, rarity, newBalance: profile.total_coins - box.coin_price }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
