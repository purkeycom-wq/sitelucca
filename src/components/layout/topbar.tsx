"use client";

import { ChevronDown, Calendar, Sparkles } from "lucide-react";

export function Topbar({
  clientName,
  source,
}: {
  clientName: string;
  source: "live" | "mock";
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-5 py-3.5 backdrop-blur-md lg:px-8">
      <button className="card flex items-center gap-2 px-3 py-2 text-sm font-semibold shadow-none hover:shadow-card">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-bispo-green/10 text-xs font-bold text-bispo-green">
          {clientName.charAt(0)}
        </span>
        {clientName}
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      <button className="card flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground shadow-none hover:shadow-card">
        <Calendar className="h-4 w-4 text-muted" />
        Últimos 30 dias
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <span
          className={
            "pill " +
            (source === "live"
              ? "bg-positive/10 text-positive"
              : "bg-warning/10 text-warning")
          }
          title={
            source === "live"
              ? "Dados ao vivo via Windsor.ai"
              : "Dados de demonstração — conecte o Windsor.ai para dados reais"
          }
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {source === "live" ? "Windsor.ai ao vivo" : "Modo demonstração"}
        </span>

        <button className="flex items-center gap-2 rounded-xl bg-bispo-blue px-3.5 py-2 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5">
          <Sparkles className="h-4 w-4" />
          Perguntar à Bispo IA
        </button>

        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-bispo-green to-bispo-blue" />
      </div>
    </header>
  );
}
