-- Create user_daily_stats view (materialized)
CREATE TABLE IF NOT EXISTS public.user_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habits_completed INTEGER NOT NULL DEFAULT 0,
  habits_total INTEGER NOT NULL DEFAULT 0,
  completion_percent INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  exp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own daily stats" ON public.user_daily_stats FOR SELECT USING (public.is_own_user(user_id));

CREATE INDEX idx_user_daily_stats_user_date ON public.user_daily_stats(user_id, date DESC);
CREATE INDEX idx_user_daily_stats_user_range ON public.user_daily_stats(user_id, date);

-- Create monthly_snapshots table
CREATE TABLE IF NOT EXISTS public.monthly_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_habits INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  complete_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  exp_earned INTEGER NOT NULL DEFAULT 0,
  tournaments_played INTEGER NOT NULL DEFAULT 0,
  avg_tournament_position NUMERIC(5,2),
  loot_boxes_opened INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own snapshots" ON public.monthly_snapshots FOR SELECT USING (public.is_own_user(user_id));

CREATE INDEX idx_monthly_snapshots_user_date ON public.monthly_snapshots(user_id, year, month);

-- Create yearly_snapshots table
CREATE TABLE IF NOT EXISTS public.yearly_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_habits_completed INTEGER NOT NULL DEFAULT 0,
  total_days_active INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak_start_date DATE,
  longest_streak_end_date DATE,
  total_coins_earned INTEGER NOT NULL DEFAULT 0,
  total_exp_earned INTEGER NOT NULL DEFAULT 0,
  favorite_habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  favorite_habit_completions INTEGER NOT NULL DEFAULT 0,
  tournaments_completed INTEGER NOT NULL DEFAULT 0,
  avg_tournament_position NUMERIC(5,2),
  items_acquired INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, year)
);
ALTER TABLE public.yearly_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own yearly snapshots" ON public.yearly_snapshots FOR SELECT USING (public.is_own_user(user_id));

-- Function to materialize daily stats for a user
CREATE OR REPLACE FUNCTION public.materialize_daily_stats(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_habits_completed INTEGER;
  v_habits_total INTEGER;
  v_completion_percent INTEGER;
  v_coins_earned INTEGER;
  v_exp_earned INTEGER;
BEGIN
  -- Count completed habits for the date
  SELECT COUNT(*) INTO v_habits_completed
  FROM habit_completions
  WHERE user_id = p_user_id AND completed_date = p_date;

  -- Count total habits for the user
  SELECT COUNT(*) INTO v_habits_total
  FROM habits
  WHERE user_id = p_user_id AND archived = false;

  -- Calculate completion percent
  v_completion_percent := CASE 
    WHEN v_habits_total = 0 THEN 0
    ELSE ROUND(100.0 * v_habits_completed / v_habits_total)::INTEGER
  END;

  -- Get coins earned from tournament history for this date
  SELECT COALESCE(SUM(coins_earned), 0) INTO v_coins_earned
  FROM tournament_participants tp
  WHERE tp.user_id = p_user_id;

  -- For now, EXP earned is tracked separately - we'll aggregate from profile
  -- This would typically come from habit completion triggers
  v_exp_earned := 0;

  -- Upsert into user_daily_stats
  INSERT INTO user_daily_stats (user_id, date, habits_completed, habits_total, completion_percent, coins_earned, exp_earned)
  VALUES (p_user_id, p_date, v_habits_completed, v_habits_total, v_completion_percent, v_coins_earned, v_exp_earned)
  ON CONFLICT (user_id, date) DO UPDATE SET
    habits_completed = v_habits_completed,
    habits_total = v_habits_total,
    completion_percent = v_completion_percent,
    coins_earned = v_coins_earned,
    exp_earned = v_exp_earned,
    updated_at = now();
END;
$$;

-- Function to materialize all daily stats for a user (7 days)
CREATE OR REPLACE FUNCTION public.materialize_daily_stats_range(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_date DATE;
BEGIN
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    PERFORM materialize_daily_stats(p_user_id, v_current_date);
    v_current_date := v_current_date + interval '1 day';
  END LOOP;
END;
$$;

-- Function to create monthly snapshot (call this on 1st of next month via cron)
CREATE OR REPLACE FUNCTION public.create_monthly_snapshot(p_user_id UUID, p_year INTEGER, p_month INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_completions INTEGER;
  v_complete_days INTEGER;
  v_best_streak INTEGER;
  v_coins_earned INTEGER;
  v_exp_earned INTEGER;
  v_tournaments_played INTEGER;
  v_avg_position NUMERIC;
  v_first_day DATE;
  v_last_day DATE;
  v_total_habits INTEGER;
BEGIN
  -- Calculate date range for the month
  v_first_day := (p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01')::DATE;
  v_last_day := (v_first_day + interval '1 month' - interval '1 day')::DATE;

  -- Count total habits created by user
  SELECT COUNT(*) INTO v_total_habits
  FROM habits
  WHERE user_id = p_user_id AND archived = false;

  -- Count completions this month
  SELECT COUNT(*) INTO v_total_completions
  FROM habit_completions
  WHERE user_id = p_user_id 
    AND completed_date >= v_first_day 
    AND completed_date <= v_last_day;

  -- Count complete days (days where all habits were done)
  SELECT COUNT(DISTINCT date) INTO v_complete_days
  FROM user_daily_stats
  WHERE user_id = p_user_id 
    AND completed_date >= v_first_day 
    AND completed_date <= v_last_day
    AND completion_percent = 100;

  -- Calculate best streak in this month
  v_best_streak := 0; -- To be enhanced with streak calculation logic

  -- Sum coins earned
  SELECT COALESCE(SUM(coins_earned), 0) INTO v_coins_earned
  FROM user_daily_stats
  WHERE user_id = p_user_id 
    AND date >= v_first_day 
    AND date <= v_last_day;

  -- Sum EXP earned
  SELECT COALESCE(SUM(exp_earned), 0) INTO v_exp_earned
  FROM user_daily_stats
  WHERE user_id = p_user_id 
    AND date >= v_first_day 
    AND date <= v_last_day;

  -- Count tournaments played
  SELECT COUNT(*) INTO v_tournaments_played
  FROM tournament_history
  WHERE user_id = p_user_id 
    AND completed_at >= v_first_day 
    AND completed_at <= v_last_day;

  -- Average tournament position
  SELECT AVG(final_position) INTO v_avg_position
  FROM tournament_history
  WHERE user_id = p_user_id 
    AND final_position IS NOT NULL
    AND completed_at >= v_first_day 
    AND completed_at <= v_last_day;

  -- Insert snapshot
  INSERT INTO monthly_snapshots (
    user_id, year, month, total_habits, total_completions, complete_days, 
    best_streak, coins_earned, exp_earned, tournaments_played, avg_tournament_position
  )
  VALUES (
    p_user_id, p_year, p_month, v_total_habits, v_total_completions, v_complete_days,
    v_best_streak, v_coins_earned, v_exp_earned, v_tournaments_played, v_avg_position
  )
  ON CONFLICT (user_id, year, month) DO UPDATE SET
    total_habits = v_total_habits,
    total_completions = v_total_completions,
    complete_days = v_complete_days,
    best_streak = v_best_streak,
    coins_earned = v_coins_earned,
    exp_earned = v_exp_earned,
    tournaments_played = v_tournaments_played,
    avg_tournament_position = v_avg_position;
END;
$$;

-- Add function to drop old monthly snapshots (keep last 24 months)
CREATE OR REPLACE FUNCTION public.cleanup_old_snapshots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM monthly_snapshots
  WHERE created_at < now() - interval '24 months';
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.materialize_daily_stats(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.materialize_daily_stats_range(UUID, DATE, DATE) TO authenticated;
