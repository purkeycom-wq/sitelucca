import { getDashboard, getIntelligence, getSelection, type PageProps } from "@/lib/data";
import { HEADLINE_KPIS } from "@/lib/metrics";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { InsightCard } from "@/components/dashboard/insight-card";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default async function DashboardPage({ searchParams }: PageProps) {
  const { clientId, days } = await getSelection(await searchParams);
  const dash = await getDashboard(clientId, days);
  const intel = await getIntelligence(dash);

  const headline = HEADLINE_KPIS.map((k) => dash.kpis.find((x) => x.key === k)!).filter(Boolean);
  const topInsight = intel.insights[0];
  const qs = `?client=${clientId}&days=${days}`;

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">
            Dashboard Executivo
          </p>
          <h1 className="font-display text-2xl font-extrabold lg:text-3xl">
            Visão geral de performance
          </h1>
          <p className="mt-1 text-sm text-muted">
            {dash.period.start} → {dash.period.end} · {dash.client.name}
          </p>
        </div>
        <Link
          href={`/dashboard/bispo-ia${qs}`}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold shadow-card transition-transform hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4 text-bispo-blue" />
          Ver análise completa da Bispo IA
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPIs em destaque */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {headline.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Tendência + Score */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <TrendChart data={dash.timeseries} />
        <ScoreRing score={intel.score} />
      </div>

      {/* Bispo IA highlight + recomendações */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-bispo-blue" />
            <h2 className="text-base font-bold">Diagnóstico em destaque</h2>
            <span className="pill ml-auto bg-bispo-blue/10 text-bispo-blue">
              {intel.source === "live" ? "Claude" : "Bispo IA local"}
            </span>
          </div>
          {topInsight ? (
            <InsightCard insight={topInsight} />
          ) : (
            <div className="card p-6 text-sm text-muted">
              Sem variações relevantes no período. Tudo sob controle. ♟
            </div>
          )}
        </div>
        <RecommendationList items={intel.recommendations.slice(0, 4)} />
      </div>

      {/* Demais KPIs */}
      <section>
        <h2 className="mb-3 text-base font-bold">Todos os indicadores</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {dash.kpis
            .filter((k) => !HEADLINE_KPIS.includes(k.key))
            .map((kpi) => (
              <KpiCard key={kpi.key} kpi={kpi} />
            ))}
        </div>
      </section>
    </div>
  );
}
