import { NextResponse } from "next/server";
import { getDashboard, getIntelligence } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * GET /api/bispo-ia?days=30
 * Retorna Score Bispo, diagnósticos e recomendações em JSON.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(7, Number(searchParams.get("days")) || 30));

  const dash = await getDashboard(days);
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
