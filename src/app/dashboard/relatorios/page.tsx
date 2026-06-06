import { getDashboard, getIntelligence, getSelection, type PageProps } from "@/lib/data";
import { FileDown, Link2, Palette, FileText } from "lucide-react";
import { formatValue } from "@/lib/utils";

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const { clientId, days } = await getSelection(await searchParams);
  const dash = await getDashboard(clientId, days);
  const intel = await getIntelligence(dash);
  const roas = dash.kpis.find((k) => k.key === "roas")?.current ?? 0;
  const leads = dash.kpis.find((k) => k.key === "leads")?.current ?? 0;

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Entregáveis</p>
          <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Relatórios</h1>
          <p className="mt-1 text-sm text-muted">Relatório executivo automático, pronto para o cliente</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/report?client=${clientId}&days=${days}`}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 rounded-xl bg-bispo-blue px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            <FileDown className="h-4 w-4" /> Gerar PDF
          </a>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background">
            <Link2 className="h-4 w-4" /> Link público
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Preview do relatório (mock de capa A4) */}
        <div className="card overflow-hidden">
          <div className="bg-board flex items-center justify-between bg-bispo-green px-6 py-5 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Relatório executivo</p>
              <p className="font-display text-xl font-extrabold">{dash.client.name}</p>
            </div>
            <FileText className="h-8 w-8 text-white/70" />
          </div>
          <div className="space-y-4 p-6">
            <p className="text-xs text-muted">
              Período {dash.period.start} → {dash.period.end}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-background p-3">
                <p className="text-[11px] uppercase text-muted">ROAS</p>
                <p className="font-display text-xl font-extrabold">{formatValue(roas, "ratio")}</p>
              </div>
              <div className="rounded-xl bg-background p-3">
                <p className="text-[11px] uppercase text-muted">Leads</p>
                <p className="font-display text-xl font-extrabold">{formatValue(leads)}</p>
              </div>
              <div className="rounded-xl bg-background p-3">
                <p className="text-[11px] uppercase text-muted">Score Bispo</p>
                <p className="font-display text-xl font-extrabold">{intel.score.overall}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-bispo-green">Destaque da Bispo IA</p>
              <p className="text-sm text-foreground/80">{intel.insights[0]?.what ?? "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-bispo-green">Recomendação principal</p>
              <p className="text-sm text-foreground/80">{intel.recommendations[0]?.title ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* White-label */}
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-bispo-blue" />
            <h3 className="text-base font-bold">White-label</h3>
          </div>
          <p className="mt-1 text-sm text-muted">
            Personalize o relatório com a marca da sua agência.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-foreground/70">Logo da agência</span>
              <div className="mt-1 flex h-16 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
                Arraste sua logo aqui
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-foreground/70">Cor primária</span>
              <div className="mt-1 flex gap-2">
                {["#52623e", "#00377e", "#cf3a3a", "#0f1411"].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-lg border border-border" style={{ background: c }} />
                ))}
              </div>
            </label>
            <button className="mt-2 w-full rounded-xl bg-bispo-green py-2.5 text-sm font-semibold text-white">
              Salvar identidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
