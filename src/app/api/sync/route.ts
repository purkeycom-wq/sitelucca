import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/db";
import { syncConnection } from "@/lib/sync";

export const dynamic = "force-dynamic";

/**
 * POST /api/sync?connection=<id>   — sincroniza uma conexão específica
 * POST /api/sync                   — sincroniza todas as conexões ACTIVE
 */
export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connection");

  try {
    if (connectionId) {
      const conn = await prisma.connection.findUnique({ where: { id: connectionId } });
      if (!conn) return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });
      const result = await syncConnection({ id: conn.id, provider: conn.provider });
      return NextResponse.json({ synced: 1, rows: result.rows, source: result.source });
    }

    const connections = await prisma.connection.findMany({ where: { status: "ACTIVE" } });
    let totalRows = 0;
    for (const conn of connections) {
      const r = await syncConnection({ id: conn.id, provider: conn.provider });
      totalRows += r.rows;
    }
    return NextResponse.json({ synced: connections.length, rows: totalRows });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
