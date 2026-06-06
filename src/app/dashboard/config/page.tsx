import { Users, Building2, KeyRound, Database } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase, prisma } from "@/lib/db";

export default async function ConfigPage() {
  const hasWindsor = !!process.env.WINDSOR_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  const user = await getCurrentUser();

  let org: { name: string; plan: string; primaryColor: string } | null = null;
  if (hasDatabase && user?.orgId) {
    org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      select: { name: true, plan: true, primaryColor: true },
    });
  }

  const planLabel: Record<string, string> = {
    STARTER: "Starter",
    PRO: "Pro",
    AGENCY: "Agência (white-label)",
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Conta</p>
        <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Configurações</h1>
      </div>

      {user && (
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-bispo-green to-bispo-blue text-sm font-bold text-white">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold">{user.name ?? "Usuário"}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <span className="pill ml-auto bg-bispo-green/10 text-bispo-green">{user.role ?? "—"}</span>
          </div>
        </div>
      )}

      <div className="card divide-y divide-border">
        <div className="flex items-center gap-3 p-4">
          <Building2 className="h-5 w-5 text-bispo-green" />
          <div className="flex-1">
            <p className="font-semibold">{org?.name ?? "Método Bispo"}</p>
            <p className="text-sm text-muted">
              {org ? (planLabel[org.plan] ?? org.plan) : "Multiempresa · Plano Agência (white-label)"}
            </p>
          </div>
          {org && (
            <span
              className="h-6 w-6 rounded-md border border-border"
              style={{ background: org.primaryColor }}
              title="Cor primária"
            />
          )}
        </div>

        <div className="flex items-center gap-3 p-4">
          <Users className="h-5 w-5 text-bispo-green" />
          <div>
            <p className="font-semibold">Equipe &amp; permissões</p>
            <p className="text-sm text-muted">Papéis: Owner, Admin, Analista, Visualizador, Cliente</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <Database className="h-5 w-5 text-bispo-green" />
          <div className="flex-1">
            <p className="font-semibold">Banco de dados</p>
            <p className="text-sm text-muted">PostgreSQL + Prisma</p>
          </div>
          <span className={"pill " + (hasDatabase ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning")}>
            {hasDatabase ? "Conectado" : "Não configurado"}
          </span>
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

      {(!hasWindsor || !hasClaude || !hasDatabase) && (
        <div className="card p-5">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Variáveis pendentes</p>
          <div className="space-y-1 font-mono text-xs">
            {!hasDatabase && <p><span className="text-warning">DATABASE_URL</span>=postgresql://…</p>}
            {!hasWindsor && <p><span className="text-warning">WINDSOR_API_KEY</span>=…</p>}
            {!hasClaude && <p><span className="text-warning">ANTHROPIC_API_KEY</span>=…</p>}
            <p className="mt-2 font-sans text-muted">Copie .env.example → .env.local e reinicie.</p>
          </div>
        </div>
      )}
    </div>
  );
}
