import type { DailyMetric } from "./types";
import { prisma } from "./db";
import { fetchMediaTimeseries } from "./windsor";

/**
 * Camada de sincronização (F1): grava séries normalizadas do Windsor no
 * Postgres. Em produção roda agendada (cron/BullMQ) e on-demand.
 */

/** Upsert idempotente de uma série diária em MetricDaily. */
export async function upsertMetricDaily(
  connectionId: string,
  channel: string,
  rows: DailyMetric[],
): Promise<number> {
  for (const r of rows) {
    const date = new Date(`${r.date}T00:00:00.000Z`);
    const impressions = Math.round(r.impressions);
    const clicks = Math.round(r.clicks);
    const data = {
      spend: r.spend,
      impressions,
      reach: Math.round(r.reach),
      clicks,
      ctr: impressions ? (clicks / impressions) * 100 : 0,
      cpc: clicks ? r.spend / clicks : 0,
      cpm: impressions ? (r.spend / impressions) * 1000 : 0,
      leads: Math.round(r.leads),
      cpl: r.leads ? r.spend / r.leads : 0,
      cpa: r.conversions ? r.spend / r.conversions : 0,
      conversions: Math.round(r.conversions),
      revenue: r.revenue,
      roas: r.spend ? r.revenue / r.spend : 0,
    };
    await prisma.metricDaily.upsert({
      where: { connectionId_date_channel: { connectionId, date, channel } },
      create: { connectionId, date, channel, ...data },
      update: data,
    });
  }
  return rows.length;
}

/**
 * Sincroniza uma conexão a partir do Windsor.ai (REST) e persiste no banco.
 * Registra um SyncLog. Requer WINDSOR_API_KEY; sem ela usa o fallback mock.
 */
export async function syncConnection(connection: {
  id: string;
  provider: string;
  channel?: string;
  days?: number;
}): Promise<{ rows: number; source: "live" | "mock" }> {
  const log = await prisma.syncLog.create({
    data: { connectionId: connection.id, status: "running" },
  });
  try {
    const { data, source } = await fetchMediaTimeseries({
      connector: connection.provider,
      days: connection.days ?? 30,
    });
    const rows = await upsertMetricDaily(connection.id, connection.channel ?? "Meta Ads", data);
    await prisma.connection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date(), status: "ACTIVE" },
    });
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "success", finishedAt: new Date() },
    });
    return { rows, source };
  } catch (err) {
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "error", error: (err as Error).message, finishedAt: new Date() },
    });
    throw err;
  }
}
