import { Check, Plus, Plug } from "lucide-react";

const CONNECTORS = [
  { group: "Meta", items: ["Facebook Ads", "Instagram Insights", "Facebook Insights"], status: "active" },
  { group: "Google", items: ["Google Ads", "GA4", "Search Console", "YouTube"], status: "active" },
  { group: "LinkedIn", items: ["LinkedIn Ads", "LinkedIn Orgânico"], status: "available" },
  { group: "TikTok", items: ["TikTok Ads", "TikTok Orgânico"], status: "available" },
  { group: "CRM", items: ["HubSpot", "RD Station", "Pipedrive", "Kommo"], status: "available" },
];

export default function ConexoesPage() {
  const live = !!process.env.WINDSOR_API_KEY;

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Integrações</p>
          <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Conexões de dados</h1>
          <p className="mt-1 text-sm text-muted">
            Todas as fontes entram pela camada Windsor.ai · 325+ conectores disponíveis
          </p>
        </div>
        <span
          className={
            "pill " + (live ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning")
          }
        >
          <Plug className="h-3.5 w-3.5" />
          {live ? "Windsor.ai conectado" : "Windsor.ai não configurado"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CONNECTORS.map((c) => (
          <div key={c.group} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{c.group}</h3>
              {c.status === "active" ? (
                <span className="pill bg-positive/10 text-positive">
                  <Check className="h-3 w-3" /> Ativo
                </span>
              ) : (
                <span className="pill bg-background text-muted">Disponível</span>
              )}
            </div>
            <ul className="mt-3 space-y-1.5">
              {c.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-bispo-green/50" />
                  {item}
                </li>
              ))}
            </ul>
            <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-semibold transition-colors hover:bg-background">
              {c.status === "active" ? "Gerenciar" : (<><Plus className="h-4 w-4" /> Conectar</>)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
