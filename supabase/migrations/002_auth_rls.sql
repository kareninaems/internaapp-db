-- ============================================================
-- MEDUSA — Migration 002
-- Supabase Auth + Apple Sign In
-- Substitui device_id por auth.uid() em todas as tabelas
-- ============================================================

-- Atualiza tabela users para usar auth.users como base
ALTER TABLE users
  DROP COLUMN IF EXISTS device_id,
  ADD COLUMN IF NOT EXISTS email        text,
  ADD COLUMN IF NOT EXISTS display_name text;

-- Remove políticas antigas (blanket service_role)
DROP POLICY IF EXISTS "service_role_all" ON users;
DROP POLICY IF EXISTS "service_role_all" ON onboarding;
DROP POLICY IF EXISTS "service_role_all" ON memory;
DROP POLICY IF EXISTS "service_role_all" ON sessions;
DROP POLICY IF EXISTS "service_role_all" ON messages;

-- ============================================================
-- RLS: cada usuário acessa só os próprios dados
-- ============================================================
CREATE POLICY "own_user_row"    ON users      FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_onboarding"  ON onboarding FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_memory"      ON memory     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions"    ON sessions   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_messages"    ON messages   FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: cria linha em public.users ao criar usuário no Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
