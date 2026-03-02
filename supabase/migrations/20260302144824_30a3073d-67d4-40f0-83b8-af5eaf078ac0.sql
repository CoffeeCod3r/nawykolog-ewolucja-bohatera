
-- Animal definitions
CREATE TABLE public.animal_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_type TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '🐾',
  passive_ability_name TEXT NOT NULL,
  passive_ability_description TEXT NOT NULL,
  passive_ability_logic JSONB NOT NULL DEFAULT '{}',
  stage_1_exp INT NOT NULL DEFAULT 0,
  stage_2_exp INT NOT NULL DEFAULT 500,
  stage_3_exp INT NOT NULL DEFAULT 2000,
  stage_4_exp INT NOT NULL DEFAULT 6000
);
ALTER TABLE public.animal_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read animal definitions" ON public.animal_definitions FOR SELECT USING (true);

-- Tournaments (before profiles FK)
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 days'),
  status TEXT NOT NULL DEFAULT 'active',
  min_exp INT NOT NULL DEFAULT 0,
  max_exp INT NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read tournaments" ON public.tournaments FOR SELECT TO authenticated USING (true);

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  province TEXT,
  animal_type TEXT REFERENCES public.animal_definitions(animal_type),
  animal_stage INT NOT NULL DEFAULT 1,
  animal_items JSONB NOT NULL DEFAULT '[]',
  weekly_coins INT NOT NULL DEFAULT 0,
  total_coins INT NOT NULL DEFAULT 0,
  exp INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  current_tournament_id UUID REFERENCES public.tournaments(id),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tournament participants
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coins_earned INT NOT NULL DEFAULT 0,
  final_position INT,
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- Helper functions (now all tables exist)
CREATE OR REPLACE FUNCTION public.is_own_user(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() = _user_id
$$;

CREATE OR REPLACE FUNCTION public.is_in_same_tournament(_target_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tournament_participants tp1
    JOIN public.tournament_participants tp2 ON tp1.tournament_id = tp2.tournament_id
    JOIN public.tournaments t ON t.id = tp1.tournament_id AND t.status = 'active'
    WHERE tp1.user_id = auth.uid() AND tp2.user_id = _target_user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tournament_participant(_tournament_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tournament_participants WHERE tournament_id = _tournament_id AND user_id = auth.uid()
  )
$$;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (
  public.is_own_user(id) OR public.is_in_same_tournament(id)
);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (public.is_own_user(id));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (public.is_own_user(id));

-- Tournament participants policies
CREATE POLICY "Participants can read own tournament" ON public.tournament_participants FOR SELECT TO authenticated
  USING (public.is_tournament_participant(tournament_id));
CREATE POLICY "System inserts participants" ON public.tournament_participants FOR INSERT TO authenticated
  WITH CHECK (public.is_own_user(user_id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habits
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✅',
  category TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON public.habits FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));

-- Habit completions
CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own completions" ON public.habit_completions FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));

-- Items
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  animal_type TEXT REFERENCES public.animal_definitions(animal_type),
  effect_type TEXT NOT NULL DEFAULT 'visual',
  image_url TEXT,
  coin_price INT NOT NULL DEFAULT 100
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read items" ON public.items FOR SELECT USING (true);

-- User items
CREATE TABLE public.user_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_equipped BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own items" ON public.user_items FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));

-- Loot boxes
CREATE TABLE public.loot_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coin_price INT NOT NULL,
  guaranteed_rarity TEXT NOT NULL DEFAULT 'common',
  bonus_rarity TEXT,
  bonus_chance NUMERIC(5,4) DEFAULT 0
);
ALTER TABLE public.loot_boxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read loot boxes" ON public.loot_boxes FOR SELECT USING (true);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own achievements" ON public.user_achievements FOR SELECT USING (public.is_own_user(user_id));
CREATE POLICY "Users insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (public.is_own_user(user_id));

-- Platform challenges
CREATE TABLE public.platform_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'daily',
  coin_reward INT NOT NULL DEFAULT 10,
  exp_reward INT NOT NULL DEFAULT 5,
  item_reward_id UUID REFERENCES public.items(id),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);
ALTER TABLE public.platform_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read challenges" ON public.platform_challenges FOR SELECT USING (true);

-- Challenge completions
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.platform_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own challenge completions" ON public.challenge_completions FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));

-- Books of week
CREATE TABLE public.books_of_week (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  affiliate_link TEXT,
  type TEXT NOT NULL DEFAULT 'book',
  week_number INT NOT NULL,
  average_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.books_of_week ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read books" ON public.books_of_week FOR SELECT USING (true);

-- Book votes
CREATE TABLE public.book_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books_of_week(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  review TEXT,
  UNIQUE(user_id, book_id)
);
ALTER TABLE public.book_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own votes" ON public.book_votes FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));
CREATE POLICY "Anyone can read votes" ON public.book_votes FOR SELECT USING (true);

-- User subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscription" ON public.user_subscriptions FOR ALL USING (public.is_own_user(user_id)) WITH CHECK (public.is_own_user(user_id));

-- Referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id),
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own referrals" ON public.referrals FOR SELECT USING (public.is_own_user(referrer_id));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
