-- ============================================================
-- MEDUSA — Migration 003
-- Laudo clínico/psicológico da usuária
-- Armazenado como texto, injetado no contexto do Claude
-- ============================================================

CREATE TABLE IF NOT EXISTS laudo (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  conteudo    text not null,
  resumo      text,               -- resumo gerado automaticamente (opcional)
  fonte       text,               -- ex: "CID-11", "DSM-5", "neuropsicológico"
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id)                 -- uma entrada por usuária, substituída ao atualizar
);

ALTER TABLE laudo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_laudo" ON laudo
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_laudo_user ON laudo(user_id);
