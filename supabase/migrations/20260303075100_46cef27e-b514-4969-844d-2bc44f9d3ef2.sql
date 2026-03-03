
-- Add extra columns to tournament_participants for passive abilities
ALTER TABLE public.tournament_participants
  ADD COLUMN IF NOT EXISTS masked_position boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dragon_bonus_days integer NOT NULL DEFAULT 0;

-- Add hibernation tracking to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hibernation_used_this_month boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hibernation_days_left integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date date;

-- Tournament reward history
CREATE TABLE IF NOT EXISTS public.tournament_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  final_position integer,
  coins_earned integer NOT NULL DEFAULT 0,
  coin_reward integer NOT NULL DEFAULT 0,
  exp_reward integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tournament_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own history" ON public.tournament_history FOR SELECT USING (is_own_user(user_id));

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function: calculate coins on habit completion
CREATE OR REPLACE FUNCTION public.handle_habit_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tournament_id uuid;
  v_tp_id uuid;
  v_animal_type text;
  v_animal_logic jsonb;
  v_base_coins integer := 5;
  v_bonus_coins integer := 0;
  v_multiplier numeric := 1.0;
  v_total_habits integer;
  v_completed_today integer;
  v_streak integer;
  v_current_coins integer;
  v_referral_count integer;
  v_hour integer;
  v_dragon_bonus integer;
BEGIN
  -- Get user's active tournament
  SELECT tp.id, tp.tournament_id, tp.coins_earned, tp.dragon_bonus_days
  INTO v_tp_id, v_tournament_id, v_current_coins, v_dragon_bonus
  FROM tournament_participants tp
  JOIN tournaments t ON t.id = tp.tournament_id AND t.status = 'active'
  WHERE tp.user_id = NEW.user_id
  LIMIT 1;

  IF v_tp_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get user profile info
  SELECT animal_type, streak_days INTO v_animal_type, v_streak
  FROM profiles WHERE id = NEW.user_id;

  -- Get animal passive logic
  SELECT passive_ability_logic INTO v_animal_logic
  FROM animal_definitions WHERE animal_type = v_animal_type;

  -- Count habits and completions today
  SELECT count(*) INTO v_total_habits
  FROM habits WHERE user_id = NEW.user_id AND archived = false;

  SELECT count(*) INTO v_completed_today
  FROM habit_completions
  WHERE user_id = NEW.user_id AND completed_date = CURRENT_DATE;

  -- Complete day bonus (all habits done)
  IF v_completed_today >= v_total_habits AND v_total_habits > 0 THEN
    v_bonus_coins := v_bonus_coins + 20;

    -- Tiger: x2 for complete day
    IF v_animal_type = 'tiger' THEN
      v_multiplier := v_multiplier * 2.0;
    END IF;
  END IF;

  -- Streak bonus: 1 coin per streak day (capped at 10)
  v_bonus_coins := v_bonus_coins + LEAST(v_streak, 10);

  -- Owl: x1.5 after 21:00
  v_hour := EXTRACT(HOUR FROM now());
  IF v_animal_type = 'owl' AND v_hour >= 21 THEN
    v_multiplier := v_multiplier * 1.5;
  END IF;

  -- Wolf: +5% per referral
  IF v_animal_type = 'wolf' THEN
    SELECT count(*) INTO v_referral_count FROM referrals WHERE referrer_id = NEW.user_id;
    IF v_referral_count > 0 THEN
      v_multiplier := v_multiplier * (1.0 + 0.05 * v_referral_count);
    END IF;
  END IF;

  -- Dragon: x2 EXP bonus (applied as coin bonus here)
  IF v_animal_type = 'dragon' AND v_dragon_bonus > 0 THEN
    v_multiplier := v_multiplier * 1.5;
  END IF;

  -- Calculate final coins
  v_base_coins := CEIL((v_base_coins + v_bonus_coins) * v_multiplier);

  -- Update tournament_participants
  UPDATE tournament_participants
  SET coins_earned = coins_earned + v_base_coins
  WHERE id = v_tp_id;

  -- Update profile coins
  UPDATE profiles
  SET weekly_coins = weekly_coins + v_base_coins,
      total_coins = total_coins + v_base_coins,
      last_active_date = CURRENT_DATE
  WHERE id = NEW.user_id;

  -- Dragon: check for 7-day streak to activate bonus
  IF v_animal_type = 'dragon' AND v_streak >= 7 AND v_dragon_bonus = 0 THEN
    UPDATE tournament_participants SET dragon_bonus_days = 3 WHERE id = v_tp_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_habit_completion ON public.habit_completions;
CREATE TRIGGER on_habit_completion
  AFTER INSERT ON public.habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_habit_completion();

-- Function to decrement dragon bonus daily (called by cron)
CREATE OR REPLACE FUNCTION public.decrement_dragon_bonus()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE tournament_participants
  SET dragon_bonus_days = dragon_bonus_days - 1
  WHERE dragon_bonus_days > 0;
END;
$$;
