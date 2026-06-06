"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Instagram,
  Clapperboard,
  Sparkles,
  FileText,
  Plug,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BispoMark } from "@/components/brand/bispo-mark";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/meta", label: "Meta Ads", icon: Megaphone },
  { href: "/dashboard/instagram", label: "Instagram", icon: Instagram },
  { href: "/dashboard/conteudo", label: "Conteúdo", icon: Clapperboard },
  { href: "/dashboard/bispo-ia", label: "Bispo IA", icon: Sparkles, highlight: true },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
  { href: "/dashboard/conexoes", label: "Conexões", icon: Plug },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-board fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-bispo-green text-white/90 lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="text-white">
          <BispoMark className="h-9 w-9" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-extrabold text-white">Método Bispo</p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/55">
            Analytics
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white text-bispo-green shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              <span>{label}</span>
              {highlight && !active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-4">
        <Link
          href="/dashboard/config"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2.2} />
          Configurações
        </Link>
        <div className="mt-3 rounded-xl bg-white/10 p-3">
          <p className="text-xs font-semibold text-white">Plano Agência</p>
          <p className="mt-0.5 text-[11px] text-white/60">White-label ativo</p>
        </div>
      </div>
    </aside>
  );
}
