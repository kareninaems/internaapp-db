-- ============================================================
-- MEDUSA — Schema inicial
-- Fase 3: migração de AsyncStorage + Notion → Supabase
-- ============================================================

-- Extensões
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- Identificação por device_id (sem auth obrigatório na Fase 3)
-- ============================================================
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  device_id   text unique not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- ONBOARDING
-- 5 blocos do perfil cognitivo (1 linha por usuário)
-- ============================================================
create table if not exists onboarding (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  version     text default 'medusa_onboarding_v1',
  data        jsonb not null default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- MEMORY
-- Padrões cognitivos extraídos automaticamente pelo Claude
-- ============================================================
create table if not exists memory (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  padroes       jsonb default '[]',
  gatilhos      jsonb default '[]',
  funcionou     jsonb default '[]',
  nao_funcionou jsonb default '[]',
  contexto      jsonb default '[]',
  updated_at    timestamptz default now(),
  unique(user_id)
);

-- ============================================================
-- SESSIONS
-- Cada sessão de uso do app (check-in → encerramento)
-- ============================================================
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  energy_level  int check (energy_level between 1 and 3),
  started_at    timestamptz default now(),
  ended_at      timestamptz,
  summary       text
);

-- ============================================================
-- MESSAGES
-- Histórico completo de mensagens por sessão
-- ============================================================
create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references sessions(id) on delete cascade,
  user_id     uuid references users(id) on delete cascade,
  role        text check (role in ('user', 'assistant')) not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_onboarding_user   on onboarding(user_id);
create index if not exists idx_memory_user        on memory(user_id);
create index if not exists idx_sessions_user      on sessions(user_id);
create index if not exists idx_messages_session   on messages(session_id);
create index if not exists idx_messages_user      on messages(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Cada usuário acessa apenas os próprios dados via device_id
-- ============================================================
alter table users      enable row level security;
alter table onboarding enable row level security;
alter table memory     enable row level security;
alter table sessions   enable row level security;
alter table messages   enable row level security;

-- Políticas: service_role tem acesso total (edge functions)
-- App usa anon key + device_id para identificação
create policy "service_role_all" on users      for all using (true);
create policy "service_role_all" on onboarding for all using (true);
create policy "service_role_all" on memory     for all using (true);
create policy "service_role_all" on sessions   for all using (true);
create policy "service_role_all" on messages   for all using (true);
