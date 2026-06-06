import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiplas conexões em dev (hot reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** true quando há um banco configurado (DATABASE_URL presente). */
export const hasDatabase = !!process.env.DATABASE_URL;
