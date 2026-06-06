import {
  LayoutDashboard,
  Megaphone,
  Instagram,
  Clapperboard,
  Sparkles,
  FileText,
  Plug,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/meta", label: "Meta Ads", icon: Megaphone },
  { href: "/dashboard/instagram", label: "Instagram", icon: Instagram },
  { href: "/dashboard/conteudo", label: "Conteúdo", icon: Clapperboard },
  { href: "/dashboard/bispo-ia", label: "Bispo IA", icon: Sparkles, highlight: true },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText },
  { href: "/dashboard/conexoes", label: "Conexões", icon: Plug },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/dashboard/config",
  label: "Configurações",
  icon: Settings,
};
