# internaapp-db

Repositório de backend e infraestrutura da **Medusa** — sistema operacional cognitivo pessoal de Emily Karenina Tiecher.

App: React Native + Expo SDK 54 | Backend: Supabase | IA: Claude Haiku

---

## Estrutura

```
prompts.ts                            identidade da Medusa (SYSTEM_PROMPT, padrões, regras)
types/
  index.ts                            tipos TypeScript compartilhados
supabase/
  config.toml                         configuração do projeto Supabase
  functions/
    claude-proxy/
      index.ts                        edge function — proxy para API Anthropic
  migrations/
    001_initial_schema.sql            schema: users, onboarding, memory, sessions, messages
```

---

## Infraestrutura

| Item | Valor |
|------|-------|
| Supabase Project ID | `wdjaggnxdbbovupfzslj` |
| Supabase URL | `https://wdjaggnxdbbovupfzslj.supabase.co` |
| Edge Function | `claude-proxy` |
| Proxy URL | `https://wdjaggnxdbbovupfzslj.supabase.co/functions/v1/claude-proxy` |
| Bundle ID | `com.medusaet.Medusa` |
| Apple Team ID | `4B7U3K9M5H` |

---

## Aplicar migration

No Supabase Dashboard → SQL Editor → colar conteúdo de `supabase/migrations/001_initial_schema.sql`.

## Deploy da edge function

```bash
supabase functions deploy claude-proxy --project-ref wdjaggnxdbbovupfzslj
```
