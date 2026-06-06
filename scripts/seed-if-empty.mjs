#!/usr/bin/env node
/**
 * Seed idempotente "só-se-vazio".
 *
 * Roda no build da Vercel (depois das migrations). Se o banco já tem usuários,
 * NÃO faz nada — preserva dados reais já sincronizados. Só popula o seed
 * inicial (admin + clientes + fixtures) quando o banco está vazio (1º deploy).
 *
 * Requer DATABASE_URL alcançável. Falhas não derrubam o build (ver vercel-build).
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const users = await prisma.user.count();
  if (users > 0) {
    console.log(`ℹ Seed pulado — ${users} usuário(s) já existem (dados preservados).`);
  } else {
    console.log("▶ Banco vazio — aplicando seed inicial (admin + clientes + dados reais)…");
    execSync("tsx prisma/seed.ts", { stdio: "inherit" });
  }
} finally {
  await prisma.$disconnect();
}
