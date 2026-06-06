"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { KpiValue } from "@/lib/types";
import { cn, formatValue } from "@/lib/utils";

export function KpiCard({ kpi }: { kpi: KpiValue }) {
  const data = kpi.series.map((v, i) => ({ i, v }));
  const color = kpi.isGood ? "#2f9e63" : "#cf3a3a";
  const Icon = kpi.trend === "up" ? ArrowUpRight : kpi.trend === "down" ? ArrowDownRight : Minus;

  return (
    <div className="card group p-4 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{kpi.label}</p>
        <span
          className={cn(
            "pill",
            kpi.isGood ? "bg-positive/10 text-positive" : "bg-critical/10 text-critical",
          )}
        >
          <Icon className="h-3 w-3" />
          {kpi.changePct >= 0 ? "+" : ""}
          {kpi.changePct.toFixed(1)}%
        </span>
      </div>

      <p className="mt-2 font-display text-2xl font-extrabold text-foreground">
        {formatValue(kpi.current, kpi.format)}
      </p>

      <div className="mt-2 h-9 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#spark-${kpi.key})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-1 text-[11px] text-muted">
        anterior: {formatValue(kpi.previous, kpi.format)}
      </p>
    </div>
  );
}
