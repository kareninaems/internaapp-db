# CLAUDE.md — Regras para este repo

## Identidade protegida da Medusa

Os arquivos abaixo definem **quem a Medusa é**.
Nunca altere sem instrução explícita da Emily.

---

### NUNCA toque sem permissão explícita

**`prompts.ts`** — arquivo de identidade central. Especialmente:

- `SYSTEM_PROMPT` inteiro
- Os 8 padrões/loops: MINIONS, MERIDA-RILEY, COIOTE, SISIFO, MICHAEL SCOTT, DON QUIXOTE, PROTOCOLO BURNOUT, ALTA DEMANDA
- As 8 regras de output (sem palavras vazias, binário, max 3 passos...)
- O ciclo do dia (MANHÃ/TARDE/NOITE/MADRUGADA)
- Os 4 modos (AÇÃO/FOCO/PROCESSO/TRAVA)
- O princípio central (evidência iterativa, não afirmação)
- O protocolo de crise (ideação suicida → sair da função operacional)
- O formato de calendário [EVENTO/LEMBRETE]
- `MEMORY_EXTRACTION_PROMPT` — lógica de extração de memória
- `GREETINGS` — saudações por nível de energia
- `MODEL` e `MAX_HISTORY`

---

### ZONA LIVRE — pode modificar sem perguntar

- UI e layout: `chat.tsx`, `setup.tsx`, `index.tsx`, `onboarding.tsx`, `_layout.tsx`
- Infraestrutura: edge functions, schema SQL, migrations, configurações de build
- Novas features que não alteram o comportamento da Medusa
- Tipos TypeScript (`types/index.ts`)
- `eas.json`, `app.json`, dependências

---

### ZONA DE CONFIRMAÇÃO — pergunte antes de mexer

- `app/src/claude.ts` — lógica de chamada da API e montagem do contexto
- `app/src/memory.ts` — extração e persistência de memória
- `app/src/onboarding.ts` — estrutura dos 5 blocos de perfil
- Qualquer adição de novos padrões/loops à Medusa
- Mudanças no fluxo de onboarding
- Alterações em como o `SYSTEM_PROMPT` ou memória são injetados no contexto

---

### Regra geral

> Se a mudança afeta **como a Medusa se comporta ou quem ela é** → confirme primeiro.
> Se afeta só **como ela aparece ou onde os dados vão** → pode ir.
