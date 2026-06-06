import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { DEFAULT_CLIENT } from "@/lib/data";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Heurística leve para o badge da topbar (a fonte real é resolvida no fetch).
  const source = process.env.WINDSOR_API_KEY ? "live" : "mock";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar clientName={DEFAULT_CLIENT.name} source={source} />
        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
