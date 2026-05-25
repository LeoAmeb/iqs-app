import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          folio: true,
          catLabel: true,
          total: true,
          status: true,
          fechaEntrega: true,
          createdAt: true,
        },
      },
      _count: { select: { pedidos: true } },
    },
  });

  if (!cliente)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(cliente);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nombre, telefono, email, notas } = body;

  if (nombre !== undefined && !nombre?.trim()) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.cliente.update({
    where: { id },
    data: {
      nombre: nombre?.trim() ?? existing.nombre,
      telefono: telefono !== undefined ? telefono?.trim() || null : existing.telefono,
      email: email !== undefined ? email?.trim() || null : existing.email,
      notas: notas !== undefined ? notas?.trim() || null : existing.notas,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Solo ADMIN puede eliminar clientes
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No permitido" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.cliente.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await prisma.cliente.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
