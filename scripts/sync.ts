import { PrismaClient } from "@prisma/client";
import { syncConnection } from "../src/lib/sync";

/**
 * CLI de sincronização (F1). Roda para todas as conexões ativas:
 *   npm run db:sync
 * Em produção, agendar (cron/BullMQ). Usa WINDSOR_API_KEY quando disponível;
 * sem ela, persiste o fallback mock — útil para demos.
 */
const prisma = new PrismaClient();

async function main() {
  const connections = await prisma.connection.findMany({
    where: { status: { in: ["ACTIVE", "PENDING"] } },
  });
  if (!connections.length) {
    console.log("Nenhuma conexão para sincronizar. Rode `npm run db:seed` primeiro.");
    return;
  }
  for (const c of connections) {
    const res = await syncConnection({ id: c.id, provider: c.provider, channel: "Meta Ads", days: 30 });
    console.log(`✓ ${c.provider} (${c.id}): ${res.rows} dias [${res.source}]`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
