"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Calendar, Sparkles, LogOut, Menu, X, Building2 } from "lucide-react";
import type { ClientRef } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BispoMark } from "@/components/brand/bispo-mark";
import { NAV, SETTINGS_ITEM } from "./nav-items";

const PERIODS = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

export function Topbar({
  clients,
  source,
  userEmail,
}: {
  clients: ClientRef[];
  source: "live" | "mock";
  userEmail?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentClientId = params.get("client") ?? clients[0]?.id ?? "";
  const days = params.get("days") ?? "30";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  const qs = params.toString() ? `?${params.toString()}` : "";

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:px-8">
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-lg border border-border bg-surface p-2 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Seletor de cliente */}
        <div className="card flex items-center gap-2 px-2.5 py-1.5 shadow-none">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-bispo-green/10 text-xs font-bold text-bispo-green">
            {(clients.find((c) => c.id === currentClientId)?.name ?? "?").charAt(0)}
          </span>
          <select
            value={currentClientId}
            onChange={(e) => setParam("client", e.target.value)}
            className="cursor-pointer bg-transparent text-sm font-semibold outline-none"
            aria-label="Selecionar cliente"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de período */}
        <div className="card hidden items-center gap-2 px-2.5 py-1.5 shadow-none sm:flex">
          <Calendar className="h-4 w-4 text-muted" />
          <select
            value={days}
            onChange={(e) => setParam("days", e.target.value)}
            className="cursor-pointer bg-transparent text-sm font-medium outline-none"
            aria-label="Selecionar período"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span
            className={cn(
              "pill hidden sm:inline-flex",
              source === "live" ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning",
            )}
            title={source === "live" ? "Dados reais do banco / Windsor.ai" : "Dados de demonstração"}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {source === "live" ? "Dados reais" : "Demonstração"}
          </span>

          <Link
            href={`/dashboard/bispo-ia${qs}`}
            className="flex items-center gap-2 rounded-xl bg-bispo-blue px-3 py-2 text-sm font-semibold text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Bispo IA</span>
          </Link>

          {/* Menu do usuário */}
          <details className="group relative">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-gradient-to-br from-bispo-green to-bispo-blue text-xs font-bold text-white">
              {(userEmail ?? "U").charAt(0).toUpperCase()}
            </summary>
            <div className="card absolute right-0 mt-2 w-56 p-2 text-sm shadow-card-hover">
              <div className="px-2 py-1.5">
                <p className="font-semibold">Conta</p>
                <p className="truncate text-xs text-muted">{userEmail ?? "—"}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <a
                href="/api/auth/logout"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-critical hover:bg-critical/5"
              >
                <LogOut className="h-4 w-4" /> Sair
              </a>
            </div>
          </details>
        </div>
      </header>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <aside className="bg-board absolute inset-y-0 left-0 flex w-64 flex-col bg-bispo-green text-white">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2">
                <BispoMark className="h-7 w-7" />
                <span className="font-display font-extrabold">Método Bispo</span>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {[...NAV, SETTINGS_ITEM].map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={`${href}${qs}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active ? "bg-white text-bispo-green" : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <a
              href="/api/auth/logout"
              className="mx-3 mb-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium"
            >
              <Building2 className="h-4 w-4" /> Sair
            </a>
          </aside>
        </div>
      )}
    </>
  );
}
