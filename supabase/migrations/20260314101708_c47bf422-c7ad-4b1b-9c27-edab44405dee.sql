
-- Temporarily drop FK constraint on profiles.id -> auth.users.id to allow bot insertion
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
