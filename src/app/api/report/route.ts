import { renderToBuffer } from "@react-pdf/renderer";
import { getDashboard, getIntelligence, getSelection } from "@/lib/data";
import { ExecutiveReport } from "@/lib/report/executive-report";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/report?client=<id>&days=30&brand=Agência&color=%2300377e
 * Gera o PDF executivo (white-label) com KPIs, Score Bispo, diagnósticos e
 * recomendações da Bispo IA.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { clientId, days } = await getSelection({
    client: searchParams.get("client") ?? undefined,
    days: searchParams.get("days") ?? undefined,
  });
  const brand = {
    name: searchParams.get("brand") ?? undefined,
    color: searchParams.get("color") ?? undefined,
  };

  const dash = await getDashboard(clientId, days);
  const intel = await getIntelligence(dash);

  const element = React.createElement(ExecutiveReport, { dash, intel, brand });
  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio-${dash.client.name.toLowerCase().replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
