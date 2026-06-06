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
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion |
| Charts | Recharts (componentes "Bispo Charts") |
| Dados | Windsor.ai (REST · `src/lib/windsor.ts`) |
| IA | Claude / Anthropic SDK (`src/lib/bispo-ia.ts`) |
| Banco | PostgreSQL + Prisma (`prisma/schema.prisma`) — multi-tenant |

## Rodando localmente

```bash
npm install
npm run dev
# http://localhost:3000  → redireciona para /dashboard
```

Sem nenhuma variável de ambiente, o app roda em **modo demonstração** com
dados mock determinísticos (e a Bispo IA usa o motor determinístico local).

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

## Roadmap (próximas fases)

- **F1** Persistência: OAuth Windsor, worker de sync (BullMQ), gravar em Postgres
- **F2** Multiempresa real: seletor de cliente conectado ao banco + Clerk orgs
- **F5** Relatório PDF executivo (React-PDF) + link público white-label
- **F6** Ações closed-loop via Windsor `execute_action` (pausar/ajustar campanha)
- **F6** Alertas proativos (CPA/frequência) por e-mail/WhatsApp

## Identidade visual

- **Verde** `#52623e` — estratégia · **Azul** `#00377e` — visão · **Branco** `#f8f8f8` — clareza
- Padrão sutil de tabuleiro (`.bg-board`) e a peça do bispo como marca.
