# ♟ Método Bispo Analytics

Plataforma de **Marketing Intelligence** premium: conecta dados via
**Windsor.ai**, processa com a **Bispo IA** (Claude) e entrega dashboards,
diagnósticos e recomendações acionáveis — com identidade visual exclusiva
inspirada no xadrez (estratégia, visão, antecipação).

> Esta entrega é a **vertical slice** ponta-a-ponta:
> **Windsor.ai → Banco/normalização → Bispo IA → Dashboard**.
> Roda 100% fora da caixa com dados de demonstração; com as chaves de API,
> usa dados reais do Windsor e análise generativa do Claude.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Framer Motion |
| Charts | Recharts (componentes "Bispo Charts") |
| Dados | Windsor.ai (REST · `src/lib/windsor.ts`) + sync para Postgres (`src/lib/sync.ts`) |
| IA | Claude / Anthropic SDK (`src/lib/bispo-ia.ts`) |
| Banco | PostgreSQL + Prisma (`prisma/schema.prisma`) — multi-tenant |
| PDF | `@react-pdf/renderer` — relatório executivo white-label (`/api/report`) |

## Rodando localmente

```bash
npm install
npm run dev
# http://localhost:3000  → redireciona para /dashboard
```

Sem nenhuma variável de ambiente, o app roda em **modo demonstração** com
dados mock determinísticos (e a Bispo IA usa o motor determinístico local).

### Persistência (F1) — Postgres + dados reais

O app lê **do banco primeiro** (`src/lib/data.ts`): Postgres → Windsor ao vivo → mock.
Para subir o banco com os **dados reais da conta Meta "mama cafe"** (puxados via
Windsor.ai e versionados em `prisma/fixtures/`):

```bash
# DATABASE_URL + AUTH_SECRET no .env apontando para um Postgres
npm run prisma:migrate     # cria as tabelas
npm run db:seed            # cria 3 clientes REAIS + usuário admin
npm run dev                # http://localhost:3000
```

**Login (após o seed):** `admin@metodobispo.com` / `bispo123`

### Autenticação & multiempresa

- Login por e-mail/senha (`bcrypt`) com sessão **JWT assinada** (`jose`) em cookie httpOnly.
- Middleware protege `/dashboard/*` (edge-safe). `AUTH_SECRET` obrigatório.
- **3 clientes reais** no seed (Mama Café, Delícias da Mama, Planeta Pizza) — o
  seletor de cliente e o de período (`?client=&days=`) recalculam todo o app.
- Modelo de papéis pronto no schema (OWNER/ADMIN/ANALYST/VIEWER/CLIENT).

> O conector Meta não expõe leads/conversões/receita sem rastreamento; o funil
> de negócio é **modelado de forma transparente** sobre o tráfego real
> (`modelFunnel` em `src/lib/metrics.ts` — premissas documentadas e ajustáveis).

Sincronização incremental (cron/manual), idempotente por `(conexão, dia, canal)`:

```bash
npm run db:sync            # puxa do Windsor (usa WINDSOR_API_KEY) e faz upsert
```

### Relatório PDF executivo

```
GET /api/report?days=30&brand=Minha%20Agência&color=%2300377e
```

Gera o PDF white-label (capa, Score Bispo, KPIs, diagnósticos, recomendações).
O botão **"Gerar PDF"** em `/dashboard/relatorios` aponta para esse endpoint.

### Dados e IA reais

Copie `.env.example` para `.env.local` e preencha:

```env
WINDSOR_API_KEY=...        # dados ao vivo (Windsor.ai)
ANTHROPIC_API_KEY=...      # Bispo IA generativa (Claude)
BISPO_IA_MODEL=claude-sonnet-4-6
DATABASE_URL=...           # PostgreSQL (para persistência — F1+)
```

O badge no topo indica a fonte (**Windsor.ai ao vivo** vs **Modo demonstração**).

## Como funciona o fluxo

```
Windsor.ai ──► windsor.ts (normaliza) ──► metrics.ts (KPIs + deltas)
                                              │
                          score.ts (Score Bispo 0-100, determinístico)
                                              │
   bispo-ia.ts: detecta sinais (math) ──► Claude interpreta ──► insights + recos
                                              │
                                     Dashboard (RSC) + /api/bispo-ia
```

**Princípio:** a IA nunca recalcula números. Um pré-processador determinístico
detecta variações e anomalias; o Claude apenas escreve a narrativa estratégica
(O quê → Por quê → Impacto → O que fazer) em JSON estruturado.

## Estrutura

```
src/
  app/
    dashboard/            # shell + páginas (executivo, meta, instagram,
    │                     #   conteúdo, bispo-ia, relatórios, conexões, config)
    api/bispo-ia/         # endpoint JSON da camada de inteligência
  components/
    brand/                # marca (peça de bispo)
    layout/               # sidebar + topbar
    dashboard/            # KPI card, charts, score ring, insight, recos
  lib/
    windsor.ts            # cliente Windsor.ai (+ fallback mock)
    bispo-ia.ts           # motor Bispo IA (sinais + Claude + fallback)
    score.ts              # algoritmo Score Bispo
    metrics.ts            # KPIs, cálculo de deltas, gerador mock
    data.ts               # orquestração dos payloads
    types.ts · utils.ts
prisma/schema.prisma      # modelo multi-tenant (Org/Client/Connection/Metric…)
```

## Roadmap

- [x] **F1** Persistência: Postgres + Prisma, sync idempotente Windsor → banco, seed com dados reais
- [x] **F5** Relatório PDF executivo white-label (`/api/report`)
- [x] **F2** Autenticação (login/sessão/middleware) + multiempresa: seletor de cliente e período
- [ ] **F1+** OAuth Windsor self-service + worker agendado (BullMQ/cron)
- [ ] **F2+** Telas de gestão de equipe/papéis e convites (RBAC aplicado nas queries)
- [ ] **F5+** Link público compartilhável (shareToken) do relatório
- [ ] **F6** Ações closed-loop via Windsor `execute_action` (pausar/ajustar campanha)
- [ ] **F6** Alertas proativos (CPA/frequência) por e-mail/WhatsApp
- [ ] **Deploy** Vercel + Postgres gerenciado (Neon/Supabase) + variáveis de ambiente

## Identidade visual

- **Verde** `#52623e` — estratégia · **Azul** `#00377e` — visão · **Branco** `#f8f8f8` — clareza
- Padrão sutil de tabuleiro (`.bg-board`) e a peça do bispo como marca.
