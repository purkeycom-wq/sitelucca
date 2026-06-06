import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getClients } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [clients, user] = await Promise.all([getClients(), getCurrentUser()]);
  const source = hasDatabase ? "live" : process.env.WINDSOR_API_KEY ? "live" : "mock";

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar clients={clients} source={source} userEmail={user?.email} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
