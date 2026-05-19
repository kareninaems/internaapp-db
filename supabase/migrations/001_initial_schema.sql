-- ============================================================
-- MEDUSA — Schema inicial
-- Fase 3: migração de AsyncStorage + Notion → Supabase
-- ============================================================

BEGIN;

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- id = auth.uid() (Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text,
  display_name  text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ============================================================
-- ONBOARDING
-- 5 blocos do perfil cognitivo (1 linha por usuária)
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  version     text DEFAULT 'medusa_onboarding_v1',
  data        jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- MEMORY
-- Padrões cognitivos extraídos automaticamente pelo Claude
-- ============================================================
CREATE TABLE IF NOT EXISTS memory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  padroes       jsonb DEFAULT '[]',
  gatilhos      jsonb DEFAULT '[]',
  funcionou     jsonb DEFAULT '[]',
  nao_funcionou jsonb DEFAULT '[]',
  contexto      jsonb DEFAULT '[]',
  updated_at    timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- SESSIONS
-- Cada sessão de uso do app (check-in → encerramento)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  energy_level  int CHECK (energy_level BETWEEN 1 AND 3),
  started_at    timestamptz DEFAULT now(),
  ended_at      timestamptz,
  summary       text
);

-- ============================================================
-- MESSAGES
-- Histórico completo de mensagens por sessão
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  role        text CHECK (role IN ('user', 'assistant')) NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- LAUDO
-- Laudo clínico/psicológico (dado sensível — LGPD Art. 11)
-- ============================================================
CREATE TABLE IF NOT EXISTS laudo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  conteudo    text NOT NULL,
  resumo      text,
  fonte       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_onboarding_user    ON onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_user         ON memory(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started    ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session    ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_user       ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created    ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_laudo_user          ON laudo(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE laudo      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_user_row"   ON users      FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_onboarding" ON onboarding FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_memory"     ON memory     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions"   ON sessions   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_messages"   ON messages   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_laudo"      ON laudo      FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-cria linha em users ao registrar via Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
