-- IDora authentication fix.
-- Supabase Auth owns passwords in auth.users. This trigger creates the
-- matching student profile without requiring an unauthenticated INSERT.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    registration_number,
    department,
    semester,
    email,
    phone
  )
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'registration_number', ''),
    NULLIF(NEW.raw_user_meta_data->>'department', ''),
    NULLIF(NEW.raw_user_meta_data->>'semester', '')::INT,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- This function exposes only a boolean, so signup can check duplicates
-- without exposing existing student profile rows.
CREATE OR REPLACE FUNCTION public.is_registration_number_available(candidate_registration_number TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(registration_number) = lower(trim(candidate_registration_number))
  );
$$;

REVOKE ALL ON FUNCTION public.is_registration_number_available(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_registration_number_available(TEXT) TO anon, authenticated;

-- Avoid recursive policy evaluation when checking administrator access.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'student');

DROP POLICY IF EXISTS "Students can view own requests" ON public.id_requests;
DROP POLICY IF EXISTS "Students can create requests" ON public.id_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.id_requests;
CREATE POLICY "Students can view own requests"
  ON public.id_requests FOR SELECT
  USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students can create requests"
  ON public.id_requests FOR INSERT
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can update requests"
  ON public.id_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view relevant status history" ON public.status_history;
CREATE POLICY "Users can view relevant status history"
  ON public.status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.id_requests
      WHERE id_requests.id = status_history.request_id
        AND (id_requests.student_id = auth.uid() OR public.is_admin())
    )
  );
