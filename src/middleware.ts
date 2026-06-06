import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  // Sem banco configurado → modo demonstração: acesso livre ao dashboard.
  if (!process.env.DATABASE_URL) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Protege apenas a área logada. APIs públicas (relatório compartilhado) ficam de fora.
export const config = {
  matcher: ["/dashboard/:path*"],
};
