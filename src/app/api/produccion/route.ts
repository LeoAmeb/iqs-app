import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const items = await prisma.pedidoItem.findMany({
    include: {
      pedido: {
        select: {
          folio: true,
          clienteNombre: true,
          fechaEntrega: true,
          status: true,
          telefono: true,
          notas: true,
        },
      },
      logs: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    // formSnapshot is included by default (all scalar fields are returned)
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}
