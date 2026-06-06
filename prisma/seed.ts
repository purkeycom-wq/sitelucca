import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { modelFunnel, mockSocial, mockContent } from "../src/lib/metrics";
import { computeBispoScore } from "../src/lib/score";
import { upsertMetricDaily } from "../src/lib/sync";
import type { DailyMetric, SocialPoint, ContentPiece } from "../src/lib/types";

const prisma = new PrismaClient();

// Carteira de clientes (dados REAIS de Meta Ads via Windsor.ai, em fixtures).
const CLIENTS = [
  { id: "demo", name: "Mama Café", account: "1591108058632098", fixture: "facebook-mamacafe.json", seed: 11 },
  { id: "delicias", name: "Delícias da Mama", account: "1338859038103169", fixture: "facebook-deliciasdamama.json", seed: 23 },
  { id: "planeta", name: "Planeta Pizza", account: "836829625680394", fixture: "facebook-planetapizza.json", seed: 41 },
];

function loadFixture(file: string): DailyMetric[] {
  const json = JSON.parse(readFileSync(join(process.cwd(), "prisma/fixtures", file), "utf-8")) as {
    rows: { date: string; spend: number; impressions: number; reach: number; clicks: number }[];
  };
  return json.rows
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
}

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "metodo-bispo" },
    create: { name: "Método Bispo", slug: "metodo-bispo", plan: "AGENCY", primaryColor: "#52623e" },
    update: {},
  });

  // ── Usuário admin (login: admin@metodobispo.com / bispo123) ──
  const passwordHash = await bcrypt.hash("bispo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@metodobispo.com" },
    create: { email: "admin@metodobispo.com", name: "Lucca Bispo", passwordHash },
    update: { passwordHash },
  });
  await prisma.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
    create: { userId: user.id, orgId: org.id, role: "OWNER" },
    update: { role: "OWNER" },
  });

  // ── Clientes + conexões + dados ──
  for (const c of CLIENTS) {
    const client = await prisma.client.upsert({
      where: { id: c.id },
      create: { id: c.id, orgId: org.id, name: c.name },
      update: { name: c.name, orgId: org.id },
    });

    const connection = await prisma.connection.upsert({
      where: { id: `${c.id}-facebook` },
      create: {
        id: `${c.id}-facebook`,
        clientId: client.id,
        provider: "facebook",
        windsorAccountId: c.account,
        status: "ACTIVE",
      },
      update: { windsorAccountId: c.account, status: "ACTIVE" },
    });

    const series = loadFixture(c.fixture);
    const n = await upsertMetricDaily(connection.id, "Meta Ads", series);

    const social: SocialPoint[] = mockSocial(30, c.seed);
    for (const s of social) {
      const date = new Date(`${s.date}T00:00:00Z`);
      await prisma.socialDaily.upsert({
        where: { connectionId_date: { connectionId: connection.id, date } },
        create: {
          connectionId: connection.id, date,
          followers: s.followers, followersGained: s.followersGained, reach: s.reach,
          impressions: s.impressions, engagement: s.engagement, engagementRate: s.engagementRate,
          shares: s.shares, saves: s.saves, profileVisits: s.profileVisits, profileClicks: s.profileClicks,
        },
        update: {},
      });
    }

    const content: ContentPiece[] = mockContent(c.seed);
    for (const p of content) {
      await prisma.contentItem.upsert({
        where: { connectionId_externalId: { connectionId: connection.id, externalId: p.id } },
        create: {
          connectionId: connection.id, externalId: p.id, type: p.type, caption: p.caption,
          thumbnailUrl: p.thumbnailUrl, publishedAt: new Date(`${p.publishedAt}T00:00:00Z`),
          reach: p.reach, impressions: p.impressions, likes: p.likes, comments: p.comments,
          shares: p.shares, saves: p.saves, retention: p.retention, followersGained: p.followersGained,
        },
        update: {},
      });
    }

    const score = computeBispoScore(series, social, content);
    const today = new Date(new Date().toISOString().slice(0, 10));
    await prisma.scoreSnapshot.upsert({
      where: { clientId_date: { clientId: client.id, date: today } },
      create: {
        clientId: client.id, date: today, content: score.content, growth: score.growth,
        traffic: score.traffic, conversion: score.conversion, engagement: score.engagement,
        overall: score.overall, status: score.status, reasoning: { text: score.reasoning },
      },
      update: { overall: score.overall, status: score.status },
    });

    console.log(`  • ${c.name}: ${n} dias reais, Score ${score.overall} (${score.status})`);
  }

  console.log("✓ Seed concluído. Login: admin@metodobispo.com / bispo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
