import { NextResponse } from "next/server";
import { getDashboard, getIntelligence, getSelection } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/bispo-ia?client=<id>&days=30
 * Retorna Score Bispo, diagnósticos e recomendações em JSON.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { clientId, days } = await getSelection({
    client: searchParams.get("client") ?? undefined,
    days: searchParams.get("days") ?? undefined,
  });

  const dash = await getDashboard(clientId, days);
  const intel = await getIntelligence(dash);

  return NextResponse.json({
    client: dash.client,
    period: dash.period,
    source: intel.source,
    score: intel.score,
    insights: intel.insights,
    recommendations: intel.recommendations,
  });
}
