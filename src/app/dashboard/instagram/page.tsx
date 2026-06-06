import { getDashboard, getSelection, type PageProps } from "@/lib/data";
import { SocialChart } from "@/components/dashboard/social-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatValue, pctChange } from "@/lib/utils";
import type { SocialPoint } from "@/lib/types";

function sumHalf(rows: SocialPoint[], key: keyof SocialPoint) {
  return rows.reduce((s, r) => s + (r[key] as number), 0);
}

export default async function InstagramPage({ searchParams }: PageProps) {
  const { clientId, days } = await getSelection(await searchParams);
  const dash = await getDashboard(clientId, days);
  const social = dash.social;
  const half = Math.floor(social.length / 2);
  const prev = social.slice(0, half);
  const curr = social.slice(half);

  const delta = (key: keyof SocialPoint) =>
    pctChange(sumHalf(curr, key), sumHalf(prev, key));

  const followersGained = sumHalf(curr, "followersGained");
  const avgEng =
    curr.reduce((s, p) => s + p.engagementRate, 0) / Math.max(1, curr.length);
  const avgEngPrev =
    prev.reduce((s, p) => s + p.engagementRate, 0) / Math.max(1, prev.length);

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Orgânico</p>
        <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Instagram</h1>
        <p className="mt-1 text-sm text-muted">
          {social[social.length - 1].followers.toLocaleString("pt-BR")} seguidores · últimos 30 dias
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Novos seguidores" value={`+${formatValue(followersGained)}`} changePct={delta("followersGained")} />
        <StatCard label="Alcance" value={formatValue(sumHalf(curr, "reach"))} changePct={delta("reach")} />
        <StatCard label="Impressões" value={formatValue(sumHalf(curr, "impressions"))} changePct={delta("impressions")} />
        <StatCard label="Taxa de engajamento" value={`${avgEng.toFixed(1)}%`} changePct={pctChange(avgEng, avgEngPrev)} />
        <StatCard label="Salvamentos" value={formatValue(sumHalf(curr, "saves"))} changePct={delta("saves")} />
        <StatCard label="Compartilhamentos" value={formatValue(sumHalf(curr, "shares"))} changePct={delta("shares")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <SocialChart data={social} />
        <div className="space-y-3">
          <StatCard label="Visitas ao perfil" value={formatValue(sumHalf(curr, "profileVisits"))} changePct={delta("profileVisits")} />
          <StatCard label="Cliques no perfil" value={formatValue(sumHalf(curr, "profileClicks"))} changePct={delta("profileClicks")} />
          <StatCard label="Engajamentos totais" value={formatValue(sumHalf(curr, "engagement"))} changePct={delta("engagement")} />
        </div>
      </div>
    </div>
  );
}
