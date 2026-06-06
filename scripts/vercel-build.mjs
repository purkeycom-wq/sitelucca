#!/usr/bin/env node
/**
 * Build resiliente para a Vercel.
 *
 * Objetivo: o site SEMPRE publica — mesmo sem banco (modo demonstração).
 *
 *   1) prisma generate            → obrigatório (o client precisa compilar)
 *   2) prisma migrate deploy      → só quando há DATABASE_URL; falha NÃO
 *                                   derruba o build (o app cai p/ mock e o
 *                                   `db:seed` aplica o schema depois)
 *   3) next build                 → obrigatório
 *
 * Assim, "Deploy" funciona out-of-the-box e, ao adicionar DATABASE_URL nas
 * variáveis da Vercel, as migrations passam a rodar automaticamente.
 */
import { execSync } from "node:child_process";

function run(cmd, { fatal = true } = {}) {
  console.log(`\n▶ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch (err) {
    if (fatal) throw err;
    console.warn(`⚠ Comando falhou (ignorado, build continua): ${cmd}`);
    console.warn(`  ${err?.message ?? err}`);
    return false;
  }
}

// 1) Prisma Client — necessário para o build TypeScript/Next.
run("prisma generate");

// 2) Migrations — apenas com banco configurado; nunca bloqueiam o deploy.
const hasDb = !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "";
if (hasDb) {
  run("prisma migrate deploy", { fatal: false });
} else {
  console.log("\nℹ DATABASE_URL ausente — pulando migrations (deploy em modo demonstração).");
}

// 3) Next.js build.
run("next build");
