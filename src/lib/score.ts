import type { BispoScore, DailyMetric, SocialPoint, ContentPiece, ScoreStatus } from "./types";

/** Normaliza um valor dentro de uma faixa esperada para 0-100. */
function scale(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const v = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function statusOf(score: number): ScoreStatus {
  if (score >= 80) return "EXCELLENT";
  if (score >= 60) return "ATTENTION";
  return "CRITICAL";
}

/**
 * Score Bispo — métrica proprietária 0-100 em 5 pilares.
 * Determinístico e explicável (sem IA): a IA apenas narra o porquê.
 */
export function computeBispoScore(
  series: DailyMetric[],
  social: SocialPoint[],
  content: ContentPiece[],
): BispoScore {
  const half = Math.floor(series.length / 2);
  const curr = series.slice(half);
  const prev = series.slice(0, half);

  const tot = (rows: DailyMetric[], k: keyof DailyMetric) =>
    rows.reduce((s, r) => s + (r[k] as number), 0);

  // Tráfego: eficiência de CTR + tendência de alcance.
  const ctr = tot(curr, "impressions") ? (tot(curr, "clicks") / tot(curr, "impressions")) * 100 : 0;
  const traffic = Math.round(0.6 * scale(ctr, 0.8, 3.0) + 0.4 * scale(tot(curr, "reach") / Math.max(1, tot(prev, "reach")), 0.8, 1.3));

  // Conversão: ROAS + taxa lead→conversão.
  const roas = tot(curr, "spend") ? tot(curr, "revenue") / tot(curr, "spend") : 0;
  const cvr = tot(curr, "leads") ? tot(curr, "conversions") / tot(curr, "leads") : 0;
  const conversion = Math.round(0.65 * scale(roas, 1, 6) + 0.35 * scale(cvr * 100, 10, 40));

  // Crescimento: ritmo de novos seguidores (atual vs anterior).
  const sHalf = Math.floor(social.length / 2);
  const gainedCurr = social.slice(sHalf).reduce((s, p) => s + p.followersGained, 0);
  const gainedPrev = social.slice(0, sHalf).reduce((s, p) => s + p.followersGained, 0) || 1;
  const growth = scale(gainedCurr / gainedPrev, 0.6, 1.4);

  // Engajamento: taxa média recente.
  const engRate =
    social.slice(sHalf).reduce((s, p) => s + p.engagementRate, 0) / Math.max(1, social.slice(sHalf).length);
  const engagement = scale(engRate, 2, 8);

  // Conteúdo: alcance médio + saves (sinal de qualidade) + retenção.
  const avgReach = content.reduce((s, c) => s + c.reach, 0) / Math.max(1, content.length);
  const avgSaves = content.reduce((s, c) => s + c.saves, 0) / Math.max(1, content.length);
  const avgRet = content.reduce((s, c) => s + c.retention, 0) / Math.max(1, content.length);
  const contentScore = Math.round(
    0.4 * scale(avgReach, 5000, 35000) + 0.3 * scale(avgSaves, 100, 1200) + 0.3 * scale(avgRet, 40, 90),
  );

  const overall = Math.round(
    0.22 * traffic + 0.24 * conversion + 0.18 * growth + 0.18 * engagement + 0.18 * contentScore,
  );

  const pillars = { traffic, conversion, growth, engagement, content: contentScore };
  const weakest = Object.entries(pillars).sort((a, b) => a[1] - b[1])[0];
  const strongest = Object.entries(pillars).sort((a, b) => b[1] - a[1])[0];
  const labels: Record<string, string> = {
    traffic: "Tráfego",
    conversion: "Conversão",
    growth: "Crescimento",
    engagement: "Engajamento",
    content: "Conteúdo",
  };

  const reasoning = `Score puxado por ${labels[strongest[0]]} (${strongest[1]}). O pilar mais frágil é ${labels[weakest[0]]} (${weakest[1]}) — é onde está a maior alavanca de ganho. ROAS atual ${roas.toFixed(2)}x e CTR ${ctr.toFixed(2)}%.`;

  return {
    content: contentScore,
    growth,
    traffic,
    conversion,
    engagement,
    overall,
    status: statusOf(overall),
    reasoning,
  };
}
