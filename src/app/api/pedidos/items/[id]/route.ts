import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const item = await prisma.pedidoItem.findUnique({
    where: { id },
    include: {
      pedido: {
        select: {
          folio: true,
          clienteNombre: true,
          fechaEntrega: true,
          telefono: true,
          notas: true,
          status: true,
        },
      },
      logs: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const body = await req.json() as { status: string; nota?: string };
  const { status, nota } = body;
  if (!status) return NextResponse.json({ error: "Status requerido" }, { status: 400 });

  const item = await prisma.pedidoItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.pedidoItem.update({
      where: { id },
      data: { status },
    }),
    prisma.pedidoItemLog.create({
      data: {
        itemId: id,
        fromStatus: item.status,
        toStatus: status,
        nota: nota ?? null,
        userId: session.user.id,
      },
    }),
  ]);

  const updated = await prisma.pedidoItem.findUnique({
    where: { id },
    include: {
      pedido: {
        select: {
          folio: true,
          clienteNombre: true,
          fechaEntrega: true,
          telefono: true,
          notas: true,
          status: true,
        },
      },
      logs: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(updated);
}
