import type { DailyMetric } from "./types";
import { mockTimeseries, modelFunnel } from "./metrics";

/**
 * Cliente Windsor.ai — camada principal de dados.
 *
 * Quando WINDSOR_API_KEY está definida, busca dados reais do endpoint de
 * conectores. Sem a chave (ou em caso de erro), cai para o gerador mock,
 * mantendo o vertical slice 100% funcional fora da caixa.
 *
 * Docs: https://windsor.ai — endpoint REST de conectores:
 *   https://connectors.windsor.ai/{connector}?api_key=...&fields=...&date_preset=...
 */

const BASE = "https://connectors.windsor.ai";

// Campos válidos por conector (validados via Windsor get_fields).
// Meta (facebook) não expõe leads/conversões/receita sem rastreamento — o
// funil é modelado depois (ver modelFunnel). Outros conectores entram em F1+.
const CONNECTOR_FIELDS: Record<string, string[]> = {
  facebook: ["date", "spend", "impressions", "reach", "clicks", "cpc", "cpm", "ctr"],
  google_ads: ["date", "spend", "impressions", "clicks", "conversions", "conversion_value"],
};

type WindsorRow = Record<string, string | number | null>;

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

/** Normaliza linhas heterogêneas do Windsor para o nosso DailyMetric. */
function normalize(rows: WindsorRow[]): DailyMetric[] {
  const byDate = new Map<string, DailyMetric>();
  for (const r of rows) {
    const date = String(r.date ?? "").slice(0, 10);
    if (!date) continue;
    const acc =
      byDate.get(date) ??
      { date, spend: 0, impressions: 0, reach: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0 };
    acc.spend += num(r.spend);
    acc.impressions += num(r.impressions);
    acc.reach += num(r.reach);
    acc.clicks += num(r.clicks);
    acc.leads += num(r.leads);
    acc.conversions += num(r.conversions);
    acc.revenue += num(r.conversion_value ?? r.revenue);
    byDate.set(date, acc);
  }
  // modela o funil quando o conector não expõe leads/conversões/receita.
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(modelFunnel);
}

export interface FetchOptions {
  connector?: string; // ex.: facebook, google_ads
  days?: number;
}

export async function fetchMediaTimeseries(
  opts: FetchOptions = {},
): Promise<{ data: DailyMetric[]; source: "live" | "mock" }> {
  const { connector = "facebook", days = 30 } = opts;
  const apiKey = process.env.WINDSOR_API_KEY;

  if (!apiKey) {
    return { data: mockTimeseries(days), source: "mock" };
  }

  try {
    const url = new URL(`${BASE}/${connector}`);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("fields", (CONNECTOR_FIELDS[connector] ?? CONNECTOR_FIELDS.facebook).join(","));
    url.searchParams.set("date_preset", `last_${days}d`);
    if (process.env.WINDSOR_ACCOUNT_ID) {
      url.searchParams.set("account_id", process.env.WINDSOR_ACCOUNT_ID);
    }

    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Windsor ${res.status}`);
    const json = (await res.json()) as { data?: WindsorRow[] };
    const data = normalize(json.data ?? []);
    if (!data.length) throw new Error("Windsor: resposta vazia");
    return { data, source: "live" };
  } catch (err) {
    console.warn("[windsor] fallback para mock:", (err as Error).message);
    return { data: mockTimeseries(days), source: "mock" };
  }
}
