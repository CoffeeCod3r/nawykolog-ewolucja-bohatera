-- Plan limits configuration table
CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE,
  max_habits INTEGER NOT NULL DEFAULT 7,
  max_items_equipped INTEGER NOT NULL DEFAULT 3,
  max_tournaments_per_month INTEGER NOT NULL DEFAULT 4,
  coins_rate_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  exp_rate_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plan limits" ON public.plan_limits FOR SELECT USING (true);

-- Insert default plans
INSERT INTO public.plan_limits (plan_name, max_habits, max_items_equipped, max_tournaments_per_month, coins_rate_multiplier, exp_rate_multiplier, features)
VALUES 
  ('free', 7, 1, 2, 1.0, 1.0, '{"analytics": false, "export": false, "custom_avatars": false}'),
  ('pro', 15, 3, 8, 1.1, 1.1, '{"analytics": true, "export": true, "custom_avatars": true}'),
  ('premium', 30, 5, 16, 1.25, 1.25, '{"analytics": true, "export": true, "custom_avatars": true, "priority_support": true}')
ON CONFLICT (plan_name) DO UPDATE SET
  max_habits = EXCLUDED.max_habits,
  max_items_equipped = EXCLUDED.max_items_equipped,
  max_tournaments_per_month = EXCLUDED.max_tournaments_per_month,
  coins_rate_multiplier = EXCLUDED.coins_rate_multiplier,
  exp_rate_multiplier = EXCLUDED.exp_rate_multiplier,
  features = EXCLUDED.features,
  updated_at = now();

-- Function to get user's habit limit based on their plan
CREATE OR REPLACE FUNCTION public.get_user_habit_limit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_plan TEXT;
  v_max_habits INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;
  
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  SELECT max_habits INTO v_max_habits
  FROM plan_limits
  WHERE plan_name = v_plan;

  RETURN COALESCE(v_max_habits, 7);
END;
$$;

-- Function to check if user can add habit
CREATE OR REPLACE FUNCTION public.can_add_habit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_habits INTEGER;
  v_max_habits INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_current_habits
  FROM habits
  WHERE user_id = p_user_id AND archived = false;

  v_max_habits := get_user_habit_limit(p_user_id);

  RETURN v_current_habits < v_max_habits;
END;
$$;

-- Function to get user's stats summary (coins, exp, streak, etc.)
CREATE OR REPLACE FUNCTION public.get_user_stats_summary(p_user_id UUID)
RETURNS TABLE (
  total_coins INTEGER,
  total_exp INTEGER,
  current_streak INTEGER,
  animal_type TEXT,
  animal_stage INTEGER,
  habits_count INTEGER,
  completed_today INTEGER,
  plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.total_coins,
    p.exp,
    p.streak_days,
    p.animal_type,
    p.animal_stage,
    COUNT(h.id)::INTEGER as habits_count,
    (SELECT COUNT(*) FROM habit_completions 
     WHERE user_id = p_user_id AND completed_date = CURRENT_DATE)::INTEGER as completed_today,
    p.plan
  FROM profiles p
  LEFT JOIN habits h ON p.id = h.user_id AND h.archived = false
  WHERE p.id = p_user_id
  GROUP BY p.id, p.total_coins, p.exp, p.streak_days, p.animal_type, p.animal_stage, p.plan;
END;
$$;

-- Add index for better performance
CREATE INDEX idx_plan_limits_name ON public.plan_limits(plan_name);
CREATE INDEX idx_goals_user_id ON public.habits(user_id) WHERE archived = false;
