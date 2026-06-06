import { getDashboard, getIntelligence } from "@/lib/data";
import { InsightCard } from "@/components/dashboard/insight-card";
import { RecommendationList } from "@/components/dashboard/recommendation-list";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { Sparkles } from "lucide-react";

export const revalidate = 1800;

export default async function BispoIaPage() {
  const dash = await getDashboard(30);
  const intel = await getIntelligence(dash);

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bispo-blue text-white shadow-card">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Bispo IA</h1>
          <p className="text-sm text-muted">
            Seu estrategista de performance · análise{" "}
            {intel.source === "live" ? "gerada por Claude" : "determinística (conecte a chave Claude para IA generativa)"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <ScoreRing score={intel.score} />
          <RecommendationList items={intel.recommendations} />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold">
            Diagnósticos ({intel.insights.length})
          </h2>
          <p className="text-sm text-muted">
            Cada diagnóstico responde: o que aconteceu, por quê, qual o impacto e o que fazer.
          </p>
          <div className="space-y-3">
            {intel.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
