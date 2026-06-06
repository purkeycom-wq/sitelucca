import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { modelFunnel, mockSocial, mockContent } from "../src/lib/metrics";
import { computeBispoScore } from "../src/lib/score";
import { upsertMetricDaily } from "../src/lib/sync";
import type { DailyMetric, SocialPoint, ContentPiece } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  // ── Org + Client + Connection ──
  const org = await prisma.organization.upsert({
    where: { slug: "metodo-bispo" },
    create: { name: "Método Bispo", slug: "metodo-bispo", plan: "AGENCY", primaryColor: "#52623e" },
    update: {},
  });

  const client = await prisma.client.upsert({
    where: { id: "demo" },
    create: { id: "demo", orgId: org.id, name: "Mama Café" },
    update: { name: "Mama Café" },
  });

  const connection = await prisma.connection.upsert({
    where: { id: "demo-facebook" },
    create: {
      id: "demo-facebook",
      clientId: client.id,
      provider: "facebook",
      windsorAccountId: "1591108058632098",
      status: "ACTIVE",
    },
    update: {},
  });

  // ── Métricas de mídia: dados REAIS (fixture) + funil modelado ──
  const fixture = JSON.parse(
    readFileSync(join(process.cwd(), "prisma/fixtures/facebook-mamacafe.json"), "utf-8"),
  ) as { rows: { date: string; spend: number; impressions: number; reach: number; clicks: number }[] };

  const series: DailyMetric[] = fixture.rows
    .map((r) => ({
      date: r.date,
      spend: r.spend,
      impressions: r.impressions,
      reach: r.reach,
      clicks: r.clicks,
      leads: 0,
      conversions: 0,
      revenue: 0,
    }))
    .map(modelFunnel);

  const n = await upsertMetricDaily(connection.id, "Meta Ads", series);

  // ── Social orgânico (mock determinístico — IG real é esparso) ──
  const social: SocialPoint[] = mockSocial(30);
  for (const s of social) {
    await prisma.socialDaily.upsert({
      where: { connectionId_date: { connectionId: connection.id, date: new Date(`${s.date}T00:00:00Z`) } },
      create: {
        connectionId: connection.id,
        date: new Date(`${s.date}T00:00:00Z`),
        followers: s.followers,
        followersGained: s.followersGained,
        reach: s.reach,
        impressions: s.impressions,
        engagement: s.engagement,
        engagementRate: s.engagementRate,
        shares: s.shares,
        saves: s.saves,
        profileVisits: s.profileVisits,
        profileClicks: s.profileClicks,
      },
      update: {},
    });
  }

  // ── Conteúdo ──
  const content: ContentPiece[] = mockContent();
  for (const c of content) {
    await prisma.contentItem.upsert({
      where: { connectionId_externalId: { connectionId: connection.id, externalId: c.id } },
      create: {
        connectionId: connection.id,
        externalId: c.id,
        type: c.type,
        caption: c.caption,
        thumbnailUrl: c.thumbnailUrl,
        publishedAt: new Date(`${c.publishedAt}T00:00:00Z`),
        reach: c.reach,
        impressions: c.impressions,
        likes: c.likes,
        comments: c.comments,
        shares: c.shares,
        saves: c.saves,
        retention: c.retention,
        followersGained: c.followersGained,
      },
      update: {},
    });
  }

  // ── Score Bispo snapshot ──
  const score = computeBispoScore(series, social, content);
  await prisma.scoreSnapshot.upsert({
    where: { clientId_date: { clientId: client.id, date: new Date(new Date().toISOString().slice(0, 10)) } },
    create: {
      clientId: client.id,
      date: new Date(new Date().toISOString().slice(0, 10)),
      content: score.content,
      growth: score.growth,
      traffic: score.traffic,
      conversion: score.conversion,
      engagement: score.engagement,
      overall: score.overall,
      status: score.status,
      reasoning: { text: score.reasoning },
    },
    update: {},
  });

  console.log(`✓ Seed concluído: ${n} dias de mídia (reais), ${social.length} dias sociais, ${content.length} conteúdos, Score ${score.overall}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
