import type {
  ContentPiece,
  DailyMetric,
  DashboardPayload,
  IntelligencePayload,
  SocialPoint,
} from "./types";
import { computeKpis, mockContent, mockSocial } from "./metrics";
import { fetchMediaTimeseries } from "./windsor";
import { computeBispoScore } from "./score";
import { runBispoIa } from "./bispo-ia";
import { hasDatabase, prisma } from "./db";

// Cliente padrão do vertical slice (multiempresa real chega em F2 via Clerk).
export const DEFAULT_CLIENT = { id: "demo", name: "Mama Café" };

/**
 * Lê a série persistida no Postgres (F1). Retorna null quando não há banco ou
 * dados — nesse caso o caller cai para Windsor ao vivo ou mock.
 */
async function readFromDb(
  clientId: string,
  days: number,
): Promise<DashboardPayload | null> {
  if (!hasDatabase) return null;
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { connections: { select: { id: true } } },
    });
    if (!client || !client.connections.length) return null;
    const connIds = client.connections.map((c) => c.id);

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const [metrics, social, content] = await Promise.all([
      prisma.metricDaily.findMany({
        where: { connectionId: { in: connIds }, date: { gte: since } },
        orderBy: { date: "asc" },
      }),
      prisma.socialDaily.findMany({
        where: { connectionId: { in: connIds }, date: { gte: since } },
        orderBy: { date: "asc" },
      }),
      prisma.contentItem.findMany({
        where: { connectionId: { in: connIds } },
        orderBy: { reach: "desc" },
        take: 12,
      }),
    ]);
    if (!metrics.length) return null;

    const timeseries: DailyMetric[] = metrics.map((m) => ({
      date: m.date.toISOString().slice(0, 10),
      spend: m.spend,
      impressions: m.impressions,
      reach: m.reach,
      clicks: m.clicks,
      leads: m.leads,
      conversions: m.conversions,
      revenue: m.revenue,
    }));

    const socialPts: SocialPoint[] = social.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      followers: s.followers,
      followersGained: s.followersGained,
      reach: s.reach,
      impressions: s.impressions,
      engagement: s.engagement,
      engagementRate: s.engagementRate,
      shares: s.shares,
      saves: s.saves,
      profileVisits: s.profileVisits,
      profileClicks: s.profileClicks,
    }));

    const pieces: ContentPiece[] = content.map((c) => ({
      id: c.externalId,
      type: c.type,
      caption: c.caption ?? "",
      thumbnailUrl: c.thumbnailUrl,
      publishedAt: c.publishedAt.toISOString().slice(0, 10),
      reach: c.reach,
      impressions: c.impressions,
      likes: c.likes,
      comments: c.comments,
      shares: c.shares,
      saves: c.saves,
      retention: c.retention,
      followersGained: c.followersGained,
    }));

    return {
      client: { id: client.id, name: client.name },
      period: {
        start: timeseries[0]?.date ?? "",
        end: timeseries[timeseries.length - 1]?.date ?? "",
        days,
      },
      source: "live",
      kpis: computeKpis(timeseries),
      timeseries,
      social: socialPts.length ? socialPts : mockSocial(days),
      content: pieces.length ? pieces : mockContent(),
    };
  } catch (err) {
    console.warn("[data] leitura do banco falhou, usando fallback:", (err as Error).message);
    return null;
  }
}

export async function getDashboard(days = 30): Promise<DashboardPayload> {
  // 1) Banco (F1) → 2) Windsor ao vivo → 3) mock determinístico
  const fromDb = await readFromDb(DEFAULT_CLIENT.id, days);
  if (fromDb) return fromDb;

  const { data: timeseries, source } = await fetchMediaTimeseries({ days });
  const social = mockSocial(days);
  const content = mockContent();

  return {
    client: DEFAULT_CLIENT,
    period: {
      start: timeseries[0]?.date ?? "",
      end: timeseries[timeseries.length - 1]?.date ?? "",
      days,
    },
    source,
    kpis: computeKpis(timeseries),
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
