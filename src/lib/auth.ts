import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./session";

/** Verifica e-mail/senha contra o banco. Retorna o payload de sessão ou null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionPayload | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { members: { include: { org: true }, take: 1 } },
  });
  if (!user?.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  const membership = user.members[0];
  return {
    sub: user.id,
    email: user.email,
    name: user.name ?? undefined,
    orgId: membership?.orgId,
    role: membership?.role,
  };
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Sessão atual (server components / route handlers). */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
