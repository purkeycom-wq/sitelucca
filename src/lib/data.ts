import type { DashboardPayload, IntelligencePayload } from "./types";
import { computeKpis, mockContent, mockSocial } from "./metrics";
import { fetchMediaTimeseries } from "./windsor";
import { computeBispoScore } from "./score";
import { runBispoIa } from "./bispo-ia";

// Cliente padrão do vertical slice (multiempresa real chega em F0/F1).
export const DEFAULT_CLIENT = { id: "demo", name: "Mama Café" };

export async function getDashboard(days = 30): Promise<DashboardPayload> {
  const { data: timeseries, source } = await fetchMediaTimeseries({ days });
  const social = mockSocial(days);
  const content = mockContent();
  const kpis = computeKpis(timeseries);

  return {
    client: DEFAULT_CLIENT,
    period: {
      start: timeseries[0]?.date ?? "",
      end: timeseries[timeseries.length - 1]?.date ?? "",
      days,
    },
    source,
    kpis,
    timeseries,
    social,
    content,
  };
}

export async function getIntelligence(dash: DashboardPayload): Promise<IntelligencePayload> {
  const score = computeBispoScore(dash.timeseries, dash.social, dash.content);
  const ia = await runBispoIa({
    kpis: dash.kpis,
    series: dash.timeseries,
    social: dash.social,
    clientName: dash.client.name,
  });

  return {
    source: ia.source,
    score,
    insights: ia.insights,
    recommendations: ia.recommendations,
  };
}
