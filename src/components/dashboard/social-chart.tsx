"use client";

import {
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SocialPoint } from "@/lib/types";

export function SocialChart({ data }: { data: SocialPoint[] }) {
  const chart = data.map((d) => ({
    date: d.date.slice(5),
    Seguidores: d.followers,
    Novos: d.followersGained,
  }));

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold">Crescimento de seguidores</h3>
          <p className="text-sm text-muted">Base total e ganho diário</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bispo-green" /> Total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bispo-blue" /> Novos/dia
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eceee9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval={Math.ceil(chart.length / 8)}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis yAxisId="right" orientation="right" hide />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6e8e3",
                boxShadow: "0 8px 24px -12px rgba(15,20,17,0.2)",
                fontSize: 12,
              }}
            />
            <Bar yAxisId="right" dataKey="Novos" fill="#00377e" opacity={0.25} radius={[3, 3, 0, 0]} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Seguidores"
              stroke="#52623e"
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
