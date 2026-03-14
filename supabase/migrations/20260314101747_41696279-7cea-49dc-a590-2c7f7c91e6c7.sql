
-- Allow all authenticated users to read profiles for rankings
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Authenticated can read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
