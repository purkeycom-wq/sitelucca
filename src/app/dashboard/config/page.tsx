import { Users, Building2, KeyRound } from "lucide-react";

export default function ConfigPage() {
  const hasWindsor = !!process.env.WINDSOR_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Conta</p>
        <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Configurações</h1>
      </div>

      <div className="card divide-y divide-border">
        <div className="flex items-center gap-3 p-4">
          <Building2 className="h-5 w-5 text-bispo-green" />
          <div>
            <p className="font-semibold">Organização</p>
            <p className="text-sm text-muted">Multiempresa · Plano Agência (white-label)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Users className="h-5 w-5 text-bispo-green" />
          <div>
            <p className="font-semibold">Equipe &amp; permissões</p>
            <p className="text-sm text-muted">Papéis: Owner, Admin, Analista, Visualizador, Cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <KeyRound className="h-5 w-5 text-bispo-green" />
          <div className="flex-1">
            <p className="font-semibold">Chaves de API</p>
            <p className="text-sm text-muted">Defina no arquivo .env.local</p>
          </div>
          <div className="flex gap-2">
            <span className={"pill " + (hasWindsor ? "bg-positive/10 text-positive" : "bg-background text-muted")}>
              Windsor.ai {hasWindsor ? "OK" : "—"}
            </span>
            <span className={"pill " + (hasClaude ? "bg-positive/10 text-positive" : "bg-background text-muted")}>
              Claude {hasClaude ? "OK" : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
