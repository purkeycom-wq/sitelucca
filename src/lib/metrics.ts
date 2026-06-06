import type {
  ContentPiece,
  DailyMetric,
  KpiDefinition,
  KpiValue,
  SocialPoint,
} from "./types";
import { pctChange } from "./utils";

// ─────────────────── Definição dos KPIs executivos ───────────────────

export const KPI_DEFS: KpiDefinition[] = [
  { key: "spend", label: "Investimento", format: "currency" },
  { key: "impressions", label: "Impressões", format: "number" },
  { key: "reach", label: "Alcance", format: "number" },
  { key: "clicks", label: "Cliques", format: "number" },
  { key: "ctr", label: "CTR", format: "percent" },
  { key: "cpc", label: "CPC", format: "currency2", lowerIsBetter: true },
  { key: "cpm", label: "CPM", format: "currency2", lowerIsBetter: true },
  { key: "leads", label: "Leads", format: "number" },
  { key: "cpl", label: "CPL", format: "currency2", lowerIsBetter: true },
  { key: "cpa", label: "CPA", format: "currency2", lowerIsBetter: true },
  { key: "conversions", label: "Conversões", format: "number" },
  { key: "revenue", label: "Receita", format: "currency" },
  { key: "roas", label: "ROAS", format: "ratio" },
];

// KPIs em destaque no topo do dashboard executivo.
export const HEADLINE_KPIS = ["roas", "cpl", "leads", "spend", "revenue", "ctr"];

interface Totals {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

function sum(rows: DailyMetric[]): Totals {
  return rows.reduce<Totals>(
    (acc, r) => ({
      spend: acc.spend + r.spend,
      impressions: acc.impressions + r.impressions,
      reach: acc.reach + r.reach,
      clicks: acc.clicks + r.clicks,
      leads: acc.leads + r.leads,
      conversions: acc.conversions + r.conversions,
      revenue: acc.revenue + r.revenue,
    }),
    { spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0 },
  );
}

/** Deriva o valor de um KPI a partir dos totais agregados de um período. */
function derive(key: string, t: Totals): number {
  switch (key) {
    case "ctr":
      return t.impressions ? (t.clicks / t.impressions) * 100 : 0;
    case "cpc":
      return t.clicks ? t.spend / t.clicks : 0;
    case "cpm":
      return t.impressions ? (t.spend / t.impressions) * 1000 : 0;
    case "cpl":
      return t.leads ? t.spend / t.leads : 0;
    case "cpa":
      return t.conversions ? t.spend / t.conversions : 0;
    case "roas":
      return t.spend ? t.revenue / t.spend : 0;
    default:
      return (t as unknown as Record<string, number>)[key] ?? 0;
  }
}

/**
 * Calcula todos os KPIs comparando a metade atual vs. a metade anterior do
 * intervalo recebido (period-over-period). Inclui série diária p/ sparkline.
 */
export function computeKpis(series: DailyMetric[]): KpiValue[] {
  const mid = Math.floor(series.length / 2);
  const prev = series.slice(0, mid);
  const curr = series.slice(mid);
  const tCurr = sum(curr);
  const tPrev = sum(prev);

  return KPI_DEFS.map((def) => {
    const current = derive(def.key, tCurr);
    const previous = derive(def.key, tPrev);
    const changePct = pctChange(current, previous);
    const rising = changePct > 0.5;
    const falling = changePct < -0.5;
    const trend: KpiValue["trend"] = rising ? "up" : falling ? "down" : "flat";
    // "bom" depende da direção desejada da métrica.
    const isGood = def.lowerIsBetter ? changePct <= 0 : changePct >= 0;

    const series7 = curr.map((r) => derive(def.key, sum([r])));

    return {
      key: def.key,
      label: def.label,
      format: def.format,
      current,
      previous,
      changePct,
      trend,
      isGood,
      series: series7.length ? series7 : [current],
    };
  });
}

export function kpiByKey(kpis: KpiValue[], key: string): KpiValue | undefined {
  return kpis.find((k) => k.key === key);
}

/**
 * Modela o funil de conversão (leads/conversões/receita) a partir de métricas
 * reais de tráfego, quando o conector NÃO expõe esses eventos (caso comum em
 * contas Meta sem rastreamento de conversão configurado no Windsor).
 *
 * Premissas explícitas (ajustáveis por cliente em F2): 12% dos cliques viram
 * lead, 22% dos leads convertem, ticket médio R$ 180. É uma estimativa
 * transparente — não substitui o pixel/CAPI, apenas mantém os KPIs de negócio
 * úteis enquanto o rastreamento real não está conectado.
 */
export const FUNNEL_ASSUMPTIONS = { leadRate: 0.12, convRate: 0.22, ticket: 180 };

export function modelFunnel(row: DailyMetric): DailyMetric {
  const hasBusiness = row.leads > 0 || row.conversions > 0 || row.revenue > 0;
  if (hasBusiness || row.clicks <= 0) return row;
  const leads = Math.round(row.clicks * FUNNEL_ASSUMPTIONS.leadRate);
  const conversions = Math.round(leads * FUNNEL_ASSUMPTIONS.convRate);
  return { ...row, leads, conversions, revenue: conversions * FUNNEL_ASSUMPTIONS.ticket };
}

// ─────────────────── Gerador determinístico de mock ───────────────────
// Usa um PRNG com seed p/ que o mock seja estável entre renders/SSR.

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function mockTimeseries(days = 30, seed = 7): DailyMetric[] {
  const rnd = mulberry32(seed);
  const out: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    // queda intencional de performance na metade recente — alimenta a Bispo IA.
    const recent = i < days / 2;
    const fatigue = recent ? 0.82 : 1;
    const dow = new Date(isoDaysAgo(i)).getUTCDay();
    const weekend = dow === 0 || dow === 6 ? 0.7 : 1;

    const spend = (260 + rnd() * 90) * weekend;
    const cpm = (16 + rnd() * 6) / fatigue;
    const impressions = Math.round(((spend / cpm) * 1000) | 0);
    const reach = Math.round(impressions * (0.62 + rnd() * 0.1) * fatigue);
    const ctr = (0.018 + rnd() * 0.01) * fatigue;
    const clicks = Math.round(impressions * ctr);
    const leads = Math.round(clicks * (0.12 + rnd() * 0.05) * fatigue);
    const conversions = Math.round(leads * (0.22 + rnd() * 0.08));
    const revenue = conversions * (180 + rnd() * 70);

    out.push({ date: isoDaysAgo(i), spend, impressions, reach, clicks, leads, conversions, revenue });
  }
  return out;
}

export function mockSocial(days = 30, seed = 11): SocialPoint[] {
  const rnd = mulberry32(seed);
  let followers = 18420;
  const out: SocialPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const recent = i < days / 2;
    const slowdown = recent ? 0.78 : 1; // crescimento desacelera na metade recente
    const gained = Math.round((26 + rnd() * 30) * slowdown);
    followers += gained;
    const reach = Math.round((9000 + rnd() * 4000) * slowdown);
    const impressions = Math.round(reach * (1.6 + rnd() * 0.4));
    const engagement = Math.round(reach * (0.045 + rnd() * 0.02) * slowdown);
    out.push({
      date: isoDaysAgo(i),
      followers,
      followersGained: gained,
      reach,
      impressions,
      engagement,
      engagementRate: Number(((engagement / reach) * 100).toFixed(2)),
      shares: Math.round(engagement * (0.08 + rnd() * 0.05)),
      saves: Math.round(engagement * (0.11 + rnd() * 0.06)),
      profileVisits: Math.round(reach * (0.03 + rnd() * 0.02) * slowdown),
      profileClicks: Math.round(reach * (0.008 + rnd() * 0.006)),
    });
  }
  return out;
}

const CAPTIONS = [
  "3 erros que travam o seu tráfego",
  "Bastidores da campanha que vendeu R$ 40k",
  "O segredo do criativo que escala",
  "Antes e depois: conta de cliente",
  "Como dobrei o ROAS em 30 dias",
  "Tutorial: estrutura de campanha vencedora",
  "Carrossel: 7 métricas que importam",
  "Story enquete que gerou 120 leads",
];

export function mockContent(seed = 23): ContentPiece[] {
  const rnd = mulberry32(seed);
  const types: ContentPiece["type"][] = ["REEL", "REEL", "CAROUSEL", "STORY", "REEL", "CAROUSEL", "POST", "STORY"];
  return types.map((type, i) => {
    const reach = Math.round(6000 + rnd() * 30000);
    const impressions = Math.round(reach * (1.4 + rnd() * 0.6));
    const likes = Math.round(reach * (0.04 + rnd() * 0.05));
    const saves = Math.round(reach * (0.02 + rnd() * 0.04));
    const shares = Math.round(reach * (0.015 + rnd() * 0.03));
    return {
      id: `c${i + 1}`,
      type,
      caption: CAPTIONS[i % CAPTIONS.length],
      thumbnailUrl: null,
      publishedAt: isoDaysAgo(2 + i * 3),
      reach,
      impressions,
      likes,
      comments: Math.round(likes * (0.06 + rnd() * 0.05)),
      shares,
      saves,
      retention: Number((45 + rnd() * 45).toFixed(1)),
      followersGained: Math.round(saves * (0.4 + rnd() * 0.8)),
    };
  });
}
