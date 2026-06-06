import { getDashboard, getSelection, type PageProps } from "@/lib/data";
import { formatValue } from "@/lib/utils";
import { Bookmark, Share2, Eye, UserPlus, Film, Images, Image as ImageIcon, Clapperboard } from "lucide-react";
import type { ContentPiece } from "@/lib/types";

const TYPE_META: Record<ContentPiece["type"], { label: string; Icon: typeof Film; color: string }> = {
  REEL: { label: "Reel", Icon: Film, color: "text-pink-600 bg-pink-100" },
  CAROUSEL: { label: "Carrossel", Icon: Images, color: "text-bispo-blue bg-blue-100" },
  STORY: { label: "Story", Icon: Clapperboard, color: "text-amber-600 bg-amber-100" },
  POST: { label: "Post", Icon: ImageIcon, color: "text-bispo-green bg-green-100" },
};

function Metric({ Icon, value }: { Icon: typeof Eye; value: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-foreground/70">
      <Icon className="h-3.5 w-3.5 text-muted" />
      {value}
    </span>
  );
}

export default async function ConteudoPage({ searchParams }: PageProps) {
  const { clientId, days } = await getSelection(await searchParams);
  const dash = await getDashboard(clientId, days);
  const content = dash.content;
  const byReach = [...content].sort((a, b) => b.reach - a.reach);
  const byFollowers = [...content].sort((a, b) => b.followersGained - a.followersGained)[0];
  const byShares = [...content].sort((a, b) => b.shares - a.shares)[0];
  const byRetention = [...content].sort((a, b) => b.retention - a.retention)[0];

  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-bispo-green">Conteúdo</p>
        <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Análise de conteúdo</h1>
        <p className="mt-1 text-sm text-muted">Reels, Stories e Carrosséis ranqueados por performance</p>
      </div>

      {/* Destaques */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card border-l-4 border-l-bispo-green p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
            <UserPlus className="h-3.5 w-3.5" /> Mais gerou seguidores
          </p>
          <p className="mt-1 font-semibold leading-snug">{byFollowers.caption}</p>
          <p className="mt-1 text-sm font-bold text-bispo-green">+{byFollowers.followersGained} seguidores</p>
        </div>
        <div className="card border-l-4 border-l-bispo-blue p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
            <Share2 className="h-3.5 w-3.5" /> Mais compartilhado
          </p>
          <p className="mt-1 font-semibold leading-snug">{byShares.caption}</p>
          <p className="mt-1 text-sm font-bold text-bispo-blue">{formatValue(byShares.shares)} shares</p>
        </div>
        <div className="card border-l-4 border-l-warning p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted">
            <Eye className="h-3.5 w-3.5" /> Maior retenção
          </p>
          <p className="mt-1 font-semibold leading-snug">{byRetention.caption}</p>
          <p className="mt-1 text-sm font-bold text-warning">{byRetention.retention}% de retenção</p>
        </div>
      </div>

      {/* Ranking */}
      <div>
        <h2 className="mb-3 text-base font-bold">Top conteúdos por alcance</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {byReach.map((c, i) => {
            const meta = TYPE_META[c.type];
            return (
              <article key={c.id} className="card overflow-hidden transition-shadow hover:shadow-card-hover">
                <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-bispo-green/15 to-bispo-blue/15">
                  <meta.Icon className="h-9 w-9 text-bispo-green/40" />
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bispo-ink/80 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className={`pill absolute right-2 top-2 ${meta.color}`}>
                    <meta.Icon className="h-3 w-3" /> {meta.label}
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug">{c.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <Metric Icon={Eye} value={formatValue(c.reach)} />
                    <Metric Icon={Bookmark} value={formatValue(c.saves)} />
                    <Metric Icon={Share2} value={formatValue(c.shares)} />
                    <Metric Icon={UserPlus} value={`+${c.followersGained}`} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
