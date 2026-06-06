import { SignJWT, jwtVerify } from "jose";

// Módulo edge-safe (somente jose, sem Prisma) — usado pelo middleware.

export const SESSION_COOKIE = "bispo_session";
const ALG = "HS256";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export interface SessionPayload {
  sub: string; // userId
  email: string;
  name?: string;
  orgId?: string;
  role?: string;
}

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET || "dev-secret-troque-em-producao-please-32+chars";
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
