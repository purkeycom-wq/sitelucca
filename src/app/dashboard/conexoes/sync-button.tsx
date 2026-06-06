"use client";

import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncButton({
  connectionId,
  label = "Sincronizar",
  small = false,
}: {
  connectionId?: string;
  label?: string;
  small?: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSync() {
    setState("loading");
    try {
      const url = connectionId ? `/api/sync?connection=${connectionId}` : "/api/sync";
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setState("done");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const base = cn(
    "flex items-center gap-1.5 rounded-xl font-semibold transition-colors",
    small ? "px-3 py-1.5 text-xs border border-border hover:bg-background" : "px-4 py-2 text-sm bg-bispo-green text-white hover:opacity-90",
    state === "loading" && "opacity-60 cursor-not-allowed",
  );

  return (
    <button onClick={handleSync} disabled={state === "loading"} className={base}>
      {state === "done" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <RefreshCw className={cn("h-3.5 w-3.5", state === "loading" && "animate-spin")} />
      )}
      {state === "done" ? "Sincronizado!" : state === "error" ? "Erro — tentar de novo" : label}
    </button>
  );
}
