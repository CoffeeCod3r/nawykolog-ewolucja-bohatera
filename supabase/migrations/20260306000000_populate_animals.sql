-- Populate animal_definitions table with all animals
INSERT INTO public.animal_definitions (animal_type, emoji, passive_ability_name, passive_ability_description, passive_ability_logic, stage_1_exp, stage_2_exp, stage_3_exp, stage_4_exp)
VALUES
  ('wolf', '🐺', 'Wataha', '+5% monet za aktywnych znajomych', '{"type": "coin_bonus", "percentage": 5}'::jsonb, 0, 500, 2000, 6000),
  ('eagle', '🦅', 'Wzrok', 'Widzi pozycje rywali w czasie rzeczywistym', '{"type": "tournament_vision"}'::jsonb, 0, 500, 2000, 6000),
  ('bear', '🐻', 'Hibernacja', 'Raz w miesiącu 2 dni bez utraty streaka', '{"type": "hibernation", "days": 2}'::jsonb, 0, 500, 2000, 6000),
  ('fox', '🦊', 'Spryt', 'Kradzie 10 monet od wyższego gracza raz w tygodniu', '{"type": "steal_coins", "amount": 10}'::jsonb, 0, 500, 2000, 6000),
  ('tiger', '🐯', 'Polowanie', 'x2 monety za kompletny dzień', '{"type": "daily_coin_multiplier", "multiplier": 2}'::jsonb, 0, 500, 2000, 6000),
  ('dolphin', '🐬', 'Ekolokacja', 'Powiadomienie gdy rywal zbliża się w rankingu', '{"type": "rank_notification"}'::jsonb, 0, 500, 2000, 6000),
  ('owl', '🦉', 'Noc', 'x1.5 monet za nawyki po 21:00', '{"type": "time_based_bonus", "after_hour": 21, "multiplier": 1.5}'::jsonb, 0, 500, 2000, 6000),
  ('dragon', '🐉', 'Ogień', 'x2 EXP przez 3 dni po 7-dniowej serii', '{"type": "streak_bonus_exp", "streak": 7, "multiplier": 2, "days": 3}'::jsonb, 0, 500, 2000, 6000),
  ('panther', '🐆', 'Cień', 'Pozycja ukryta dla rywali przez 5 dni turnieju', '{"type": "hide_position", "days": 5}'::jsonb, 0, 500, 2000, 6000),
  ('turtle', '🐢', 'Wytrwałość', 'Maksymalna utrata 20 monet dziennie', '{"type": "max_daily_loss", "amount": 20}'::jsonb, 0, 500, 2000, 6000)
ON CONFLICT (animal_type) DO NOTHING;
