"use client";

import type { BispoScore } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS = {
  EXCELLENT: { label: "Excelente", dot: "🟢", color: "#2f9e63" },
  ATTENTION: { label: "Atenção", dot: "🟡", color: "#d6a52a" },
  CRITICAL: { label: "Crítico", dot: "🔴", color: "#cf3a3a" },
} as const;

function Pillar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "#2f9e63" : value >= 60 ? "#d6a52a" : "#cf3a3a";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground/80">{label}</span>
        <span className="font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function ScoreRing({ score }: { score: BispoScore }) {
  const status = STATUS[score.status];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score.overall / 100);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold">Score Bispo</h3>
        <span
          className="pill"
          style={{ background: `${status.color}1a`, color: status.color }}
        >
          {status.dot} {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
            <circle cx="64" cy="64" r={r} fill="none" stroke="#eceee9" strokeWidth="10" />
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              stroke={status.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-extrabold leading-none">{score.overall}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">de 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <Pillar label="Conteúdo" value={score.content} />
          <Pillar label="Crescimento" value={score.growth} />
          <Pillar label="Tráfego" value={score.traffic} />
          <Pillar label="Conversão" value={score.conversion} />
          <Pillar label="Engajamento" value={score.engagement} />
        </div>
      </div>

      <p className={cn("mt-4 rounded-xl bg-background p-3 text-xs leading-relaxed text-foreground/70")}>
        {score.reasoning}
      </p>
    </div>
  );
}
