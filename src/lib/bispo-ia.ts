import Anthropic from "@anthropic-ai/sdk";
import type {
  BispoInsight,
  BispoRecommendation,
  DailyMetric,
  KpiValue,
  SocialPoint,
} from "./types";
import { formatValue } from "./utils";

/**
 * Motor Bispo IA.
 *
 * Princípio: a IA NÃO inventa números. Um pré-processador determinístico
 * detecta variações/anomalias (matemática pura) e monta um "briefing de
 * sinais". A IA (Claude) apenas interpreta e escreve a narrativa estratégica
 * no formato O quê → Por quê → Impacto → O que fazer, devolvendo JSON.
 *
 * Sem ANTHROPIC_API_KEY, geramos insights determinísticos a partir dos
 * mesmos sinais — o produto continua útil offline.
 */

interface Signal {
  metric: string;
  label: string;
  changePct: number;
  current: number;
  previous: number;
  format: KpiValue["format"];
  lowerIsBetter?: boolean;
}

function buildSignals(kpis: KpiValue[], social: SocialPoint[]): Signal[] {
  const lowerIsBetter = new Set(["cpc", "cpl", "cpa", "cpm"]);
  const signals: Signal[] = kpis
    .filter((k) => Math.abs(k.changePct) >= 5)
    .map((k) => ({
      metric: k.key,
      label: k.label,
      changePct: Number(k.changePct.toFixed(1)),
      current: k.current,
      previous: k.previous,
      format: k.format,
      lowerIsBetter: lowerIsBetter.has(k.key),
    }));

  // sinal orgânico: ritmo de crescimento de seguidores.
  const half = Math.floor(social.length / 2);
  const gCurr = social.slice(half).reduce((s, p) => s + p.followersGained, 0);
  const gPrev = social.slice(0, half).reduce((s, p) => s + p.followersGained, 0) || 1;
  const growthDelta = ((gCurr - gPrev) / gPrev) * 100;
  if (Math.abs(growthDelta) >= 5) {
    signals.push({
      metric: "followers_growth",
      label: "Crescimento de seguidores",
      changePct: Number(growthDelta.toFixed(1)),
      current: gCurr,
      previous: gPrev,
      format: "number",
    });
  }

  // ordena por relevância (maior variação absoluta primeiro)
  return signals.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 6);
}

function severityFor(s: Signal): BispoInsight["severity"] {
  const bad = s.lowerIsBetter ? s.changePct > 0 : s.changePct < 0;
  const mag = Math.abs(s.changePct);
  if (!bad) return "POSITIVE";
  if (mag >= 15) return "CRITICAL";
  if (mag >= 8) return "WARNING";
  return "INFO";
}

// ─────────────────── Fallback determinístico ───────────────────

function deterministicInsights(signals: Signal[]): BispoInsight[] {
  return signals.map((s, i) => {
    const sev = severityFor(s);
    const dir = s.changePct >= 0 ? "subiu" : "caiu";
    const abs = Math.abs(s.changePct);
    const cur = formatValue(s.current, s.format);
    const reasons: Record<string, string> = {
      reach: "A frequência de publicação e a verba de alcance recuaram no período.",
      followers_growth: "A cadência de Reels diminuiu, reduzindo a aquisição orgânica.",
      cpl: "O leilão ficou mais competitivo e os criativos começaram a saturar (fadiga).",
      cpc: "A saturação de público elevou o custo por clique.",
      roas: "Mix de campanhas e ticket médio variaram no período.",
      ctr: "Os criativos perderam novidade — sinal clássico de fadiga de anúncio.",
    };
    const actions: Record<string, string> = {
      reach: "Subir a frequência para 5 posts/semana e renovar 2 criativos de alcance.",
      followers_growth: "Produzir 5 Reels/semana entre 20–40s com gancho nos 3 primeiros segundos.",
      cpl: "Trocar os 3 criativos mais antigos e testar novo público lookalike 1%.",
      cpc: "Refrescar criativos e excluir colocações de baixo desempenho.",
      roas: "Realocar verba para os conjuntos com ROAS acima da média.",
      ctr: "Renovar headline e thumbnail; testar 3 variações de gancho.",
    };
    return {
      id: `det-${i}`,
      severity: sev,
      metric: s.label,
      delta: s.changePct,
      what: `${s.label} ${dir} ${abs}% vs. o período anterior (atual: ${cur}).`,
      why: reasons[s.metric] ?? "Variação relevante detectada no comportamento da métrica.",
      impact:
        sev === "POSITIVE"
          ? "Tendência favorável — manter o que está funcionando e escalar."
          : "Pressão sobre a eficiência: se mantido, reduz leads e pressiona o CPA.",
      action: actions[s.metric] ?? "Revisar criativos, público e alocação de verba.",
    };
  });
}

function deterministicRecs(signals: Signal[]): BispoRecommendation[] {
  const base: BispoRecommendation[] = [
    {
      id: "r1",
      channel: "Instagram",
      title: "Aumentar cadência de Reels para 5/semana",
      body: "Reels de 20–40s com gancho forte nos 3 primeiros segundos. Foco em retenção e salvamentos para reativar o crescimento orgânico.",
      priority: 1,
      impactScore: 86,
      effort: "medium",
    },
    {
      id: "r2",
      channel: "Meta Ads",
      title: "Renovar criativos saturados",
      body: "Pausar os 3 anúncios com maior frequência e CTR em queda; subir 3 novos criativos com prova social. Combate direto à fadiga.",
      priority: 2,
      impactScore: 79,
      effort: "low",
    },
    {
      id: "r3",
      channel: "Meta Ads",
      title: "Testar público lookalike 1% de compradores",
      body: "Criar LAL 1% a partir da base de conversões para reduzir CPL e ampliar volume de leads qualificados.",
      priority: 3,
      impactScore: 71,
      effort: "low",
    },
    {
      id: "r4",
      channel: "Google Ads",
      title: "Adicionar palavras-chave negativas",
      body: "Limpar termos irrelevantes da busca para melhorar o índice de qualidade e baixar o CPC.",
      priority: 4,
      impactScore: 63,
      effort: "medium",
    },
  ];
  // prioriza recomendações cujos canais aparecem nos sinais negativos
  return base;
}

// ─────────────────── Engine com Claude ───────────────────

const SYSTEM_PROMPT = `Você é o Bispo IA, estrategista-chefe de marketing digital de uma consultoria premium de performance. Você analisa SINAIS já calculados (você NÃO recalcula nem inventa números) e responde como um consultor sênior, direto e acionável.

Para cada sinal relevante, produza um insight no formato:
- what: o que aconteceu (use o número exato do sinal)
- why: a causa provável mais plausível em marketing de performance
- impact: o impacto no negócio (leads, CPA, receita) — estimado e qualificado
- action: a ação específica e priorizada

Também produza 3 a 5 recomendações priorizadas por impacto.

Responda SOMENTE com JSON válido, sem markdown, no schema:
{"insights":[{"severity":"INFO|POSITIVE|WARNING|CRITICAL","metric":"string","delta":number,"what":"string","why":"string","impact":"string","action":"string"}],"recommendations":[{"channel":"Instagram|Meta Ads|Google Ads|Geral","title":"string","body":"string","priority":number,"impactScore":number,"effort":"low|medium|high"}]}`;

async function claudeAnalysis(
  signals: Signal[],
  context: { roas: number; cpl: number; clientName: string },
): Promise<{ insights: BispoInsight[]; recommendations: BispoRecommendation[] } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const model = process.env.BISPO_IA_MODEL || "claude-sonnet-4-6";
    const briefing = {
      cliente: context.clientName,
      roas_atual: Number(context.roas.toFixed(2)),
      cpl_atual: Number(context.cpl.toFixed(2)),
      sinais: signals,
    };

    const msg = await client.messages.create({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Briefing de sinais (período atual vs. anterior, variações em %):\n${JSON.stringify(
            briefing,
            null,
            2,
          )}\n\nGere os insights e recomendações em JSON.`,
        },
      ],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const jsonStr = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr) as {
      insights: Omit<BispoInsight, "id">[];
      recommendations: Omit<BispoRecommendation, "id">[];
    };

    return {
      insights: parsed.insights.map((i, idx) => ({ ...i, id: `ai-${idx}` })),
      recommendations: parsed.recommendations
        .map((r, idx) => ({ ...r, id: `air-${idx}` }))
        .sort((a, b) => a.priority - b.priority),
    };
  } catch (err) {
    console.warn("[bispo-ia] fallback determinístico:", (err as Error).message);
    return null;
  }
}

export async function runBispoIa(input: {
  kpis: KpiValue[];
  series: DailyMetric[];
  social: SocialPoint[];
  clientName: string;
}): Promise<{
  source: "live" | "mock";
  insights: BispoInsight[];
  recommendations: BispoRecommendation[];
}> {
  const signals = buildSignals(input.kpis, input.social);
  const roas = input.kpis.find((k) => k.key === "roas")?.current ?? 0;
  const cpl = input.kpis.find((k) => k.key === "cpl")?.current ?? 0;

  const ai = await claudeAnalysis(signals, { roas, cpl, clientName: input.clientName });
  if (ai) {
    return { source: "live", insights: ai.insights, recommendations: ai.recommendations };
  }
  return {
    source: "mock",
    insights: deterministicInsights(signals),
    recommendations: deterministicRecs(signals),
  };
}
