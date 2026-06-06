// Utilitário de teste: gera um cookie de sessão válido para o admin.
// Uso: AUTH_SECRET=... tsx scripts/mint-session.ts
import { signSession } from "../src/lib/session";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
(async () => {
  const u = await prisma.user.findUnique({
    where: { email: "admin@metodobispo.com" },
    include: { members: true },
  });
  if (!u) throw new Error("admin não encontrado — rode npm run db:seed");
  const token = await signSession({
    sub: u.id,
    email: u.email,
    name: u.name ?? undefined,
    orgId: u.members[0]?.orgId,
    role: u.members[0]?.role,
  });
  console.log(token);
  await prisma.$disconnect();
})();
