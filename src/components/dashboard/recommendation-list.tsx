import { Zap } from "lucide-react";
import type { BispoRecommendation } from "@/lib/types";

const CHANNEL_COLOR: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700",
  "Meta Ads": "bg-blue-100 text-blue-700",
  "Google Ads": "bg-amber-100 text-amber-700",
  Geral: "bg-gray-100 text-gray-700",
};

const EFFORT_LABEL: Record<string, string> = { low: "Baixo esforço", medium: "Médio esforço", high: "Alto esforço" };

export function RecommendationList({ items }: { items: BispoRecommendation[] }) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-bispo-blue" />
        <h3 className="text-base font-bold">Recomendações priorizadas</h3>
        <span className="pill ml-auto bg-bispo-blue/10 text-bispo-blue">por impacto</span>
      </div>

      <ol className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-background">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bispo-green text-sm font-bold text-white">
              {r.priority}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`pill ${CHANNEL_COLOR[r.channel] ?? CHANNEL_COLOR.Geral}`}>{r.channel}</span>
                <p className="font-semibold leading-snug">{r.title}</p>
              </div>
              <p className="mt-1 text-sm text-foreground/70">{r.body}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                <span className="font-semibold text-bispo-green">Impacto {r.impactScore}/100</span>
                <span>·</span>
                <span>{EFFORT_LABEL[r.effort] ?? r.effort}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
