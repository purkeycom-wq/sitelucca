import { TrendingDown, TrendingUp, AlertTriangle, Info, ArrowRight } from "lucide-react";
import type { BispoInsight } from "@/lib/types";

const SEVERITY = {
  CRITICAL: { color: "#cf3a3a", bg: "bg-critical/10", text: "text-critical", Icon: AlertTriangle, label: "Crítico" },
  WARNING: { color: "#d6a52a", bg: "bg-warning/10", text: "text-warning", Icon: TrendingDown, label: "Atenção" },
  POSITIVE: { color: "#2f9e63", bg: "bg-positive/10", text: "text-positive", Icon: TrendingUp, label: "Positivo" },
  INFO: { color: "#00377e", bg: "bg-bispo-blue/10", text: "text-bispo-blue", Icon: Info, label: "Info" },
} as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 py-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
      <span className="text-sm leading-snug text-foreground/85">{children}</span>
    </div>
  );
}

export function InsightCard({ insight }: { insight: BispoInsight }) {
  const s = SEVERITY[insight.severity];
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg} ${s.text}`}>
          <s.Icon className="h-4 w-4" />
        </span>
        <span className="font-bold">{insight.metric}</span>
        <span className={`pill ml-auto ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      <div className="divide-y divide-border px-4 py-1">
        <Row label="O quê">{insight.what}</Row>
        <Row label="Por quê">{insight.why}</Row>
        <Row label="Impacto">{insight.impact}</Row>
        <div className="grid grid-cols-[88px_1fr] gap-3 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-bispo-green">
            O que fazer
          </span>
          <span className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-bispo-green">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            {insight.action}
          </span>
        </div>
      </div>
    </article>
  );
}
