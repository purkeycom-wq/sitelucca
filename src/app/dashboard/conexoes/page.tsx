import { Check, Plus, Plug, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { hasDatabase, prisma } from "@/lib/db";
import { getClients, getSelection, type PageProps } from "@/lib/data";
import { SyncButton } from "./sync-button";

const PROVIDER_META: Record<string, { label: string; items: string[] }> = {
  facebook: { label: "Meta Ads", items: ["Facebook Ads", "Instagram Ads"] },
  google_ads: { label: "Google Ads", items: ["Pesquisa", "Display", "Performance Max"] },
  googleanalytics4: { label: "Google Analytics 4", items: ["Sessões", "Conversões", "Eventos"] },
  instagram_public: { label: "Instagram Orgânico", items: ["Seguidores", "Alcance", "Stories"] },
  facebook_organic: { label: "Facebook Orgânico", items: ["Posts", "Alcance", "Engajamento"] },
  searchconsole: { label: "Search Console", items: ["Cliques", "Impressões", "CTR"] },
  youtube: { label: "YouTube", items: ["Views", "Inscritos", "Retenção"] },
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-positive/10 text-positive",
  PENDING: "bg-warning/10 text-warning",
  ERROR: "bg-critical/10 text-critical",
  PAUSED: "bg-background text-muted",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  PENDING: "Pendente",
  ERROR: "Erro",
  PAUSED: "Pausado",
};

function fmtDate(d: Date | null) {
  if (!d) return "Nunca";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function ConexoesPage({ searchParams }: PageProps) {
  const { clientId } = await getSelection(await searchParams);
  const live = !!process.env.WINDSOR_API_KEY;
  const hasDb = hasDatabase;

  let connections: {
    id: string;
    provider: string;
    status: string;
    lastSyncAt: Date | null;
    windsorAccountId: string | null;
  }[] = [];

  if (hasDb) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        connections: {
          select: { id: true, provider: true, status: true, lastSyncAt: true, windsorAccountId: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    connections = client?.connections ?? [];
  }

  const AVAILABLE = [
    { group: "LinkedIn", items: ["LinkedIn Ads", "LinkedIn Orgânico"] },
    { group: "TikTok", items: ["TikTok Ads", "TikTok Orgânico"] },
    { group: "CRM", items: ["HubSpot", "RD Station", "Pipedrive", "Kommo"] },
    { group: "E-commerce", items: ["Shopify", "WooCommerce", "Hotmart"] },
  ];

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
        <div className="flex items-center gap-2">
          <span className={"pill " + (live ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning")}>
            <Plug className="h-3.5 w-3.5" />
            {live ? "Windsor.ai conectado" : "Windsor.ai não configurado"}
          </span>
          {hasDb && connections.length > 0 && <SyncButton label="Sincronizar tudo" />}
        </div>
      </div>

      {/* Conexões ativas */}
      {connections.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-bold">Conexões configuradas</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {connections.map((conn) => {
              const meta = PROVIDER_META[conn.provider] ?? { label: conn.provider, items: [] };
              return (
                <div key={conn.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">{meta.label}</h3>
                    <span className={"pill " + (STATUS_STYLE[conn.status] ?? "bg-background text-muted")}>
                      {conn.status === "ACTIVE" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {STATUS_LABEL[conn.status] ?? conn.status}
                    </span>
                  </div>

                  {conn.windsorAccountId && (
                    <p className="mt-1 text-xs text-muted">Conta: {conn.windsorAccountId}</p>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {meta.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <span className="h-1.5 w-1.5 rounded-full bg-bispo-green/50" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3 w-3" />
                    Último sync: {fmtDate(conn.lastSyncAt)}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <SyncButton connectionId={conn.id} label="Sincronizar" small />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="card p-8 text-center">
          <Plug className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 font-semibold">Nenhuma conexão configurada</p>
          <p className="text-sm text-muted">
            {hasDb
              ? "Rode npm run db:seed para criar conexões de demonstração."
              : "Configure DATABASE_URL e rode db:seed para ver conexões reais."}
          </p>
        </div>
      )}

      {/* Conectores disponíveis */}
      <section>
        <h2 className="mb-3 text-base font-bold">Conectores disponíveis</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {AVAILABLE.map((c) => (
            <div key={c.group} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.group}</h3>
                <span className="pill bg-background text-muted">Disponível</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {c.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-border" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-semibold transition-colors hover:bg-background">
                <Plus className="h-4 w-4" /> Conectar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
