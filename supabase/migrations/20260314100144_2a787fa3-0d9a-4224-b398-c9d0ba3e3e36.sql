
-- 1. Revoke UPDATE on sensitive columns in profiles from authenticated users
REVOKE UPDATE (plan, total_coins, weekly_coins, exp, streak_days, animal_stage, hibernation_days_left, hibernation_used_this_month, current_tournament_id) ON public.profiles FROM authenticated;
REVOKE UPDATE (plan, total_coins, weekly_coins, exp, streak_days, animal_stage, hibernation_days_left, hibernation_used_this_month, current_tournament_id) ON public.profiles FROM anon;

-- 2. Fix user_subscriptions: drop ALL policy, add SELECT-only for users
DROP POLICY IF EXISTS "Users manage own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can read own subscription" ON public.user_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_own_user(user_id));

-- 3. Fix materialize_daily_stats functions to check ownership
CREATE OR REPLACE FUNCTION public.materialize_daily_stats(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  INSERT INTO user_daily_stats (user_id, stat_date, habits_completed, habits_total, exp_earned, coins_earned, streak_days)
  SELECT 
    p_user_id,
    p_date,
    COALESCE((SELECT count(*) FROM habit_completions WHERE user_id = p_user_id AND completed_date = p_date), 0),
    COALESCE((SELECT count(*) FROM habits WHERE user_id = p_user_id AND archived = false), 0),
    0, 0, 0
  ON CONFLICT (user_id, stat_date) DO UPDATE SET
    habits_completed = EXCLUDED.habits_completed,
    habits_total = EXCLUDED.habits_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.materialize_daily_stats_range(p_user_id UUID, p_start DATE, p_end DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  d DATE;
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  d := p_start;
  WHILE d <= p_end LOOP
    PERFORM materialize_daily_stats(p_user_id, d);
    d := d + 1;
  END LOOP;
END;
$$;
