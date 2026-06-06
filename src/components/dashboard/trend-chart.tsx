"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyMetric } from "@/lib/types";
import { formatValue } from "@/lib/utils";

export function TrendChart({ data }: { data: DailyMetric[] }) {
  const chart = data.map((d) => ({
    date: d.date.slice(5),
    Investimento: Math.round(d.spend),
    Receita: Math.round(d.revenue),
  }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">Investimento vs. Receita</h3>
          <p className="text-sm text-muted">Evolução diária no período</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bispo-blue" /> Investimento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bispo-green" /> Receita
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#52623e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#52623e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00377e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00377e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eceee9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval={Math.ceil(chart.length / 8)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6e8e3",
                boxShadow: "0 8px 24px -12px rgba(15,20,17,0.2)",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [formatValue(value, "currency"), name]}
            />
            <Area
              type="monotone"
              dataKey="Receita"
              stroke="#52623e"
              strokeWidth={2.5}
              fill="url(#g-rev)"
            />
            <Area
              type="monotone"
              dataKey="Investimento"
              stroke="#00377e"
              strokeWidth={2.5}
              fill="url(#g-spend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
