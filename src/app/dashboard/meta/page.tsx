import { getDashboard } from "@/lib/data";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";

export const revalidate = 1800;

export default async function MetaPage() {
  const dash = await getDashboard(30);

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Tráfego pago</p>
        <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Meta Ads</h1>
        <p className="mt-1 text-sm text-muted">
          Facebook &amp; Instagram Ads · {dash.source === "live" ? "dados ao vivo" : "demonstração"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {dash.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <TrendChart data={dash.timeseries} />
    </div>
  );
}
