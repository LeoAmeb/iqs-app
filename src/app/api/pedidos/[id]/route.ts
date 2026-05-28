import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAutoStatus } from "@/lib/utils";
import { PedidoStatus, FormaPago } from "@/generated/prisma/client";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const pedido = await prisma.pedido.findFirst({
    where: { id, userId: session.user.id },
    include: { cliente: true },
  });
  if (!pedido) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(pedido);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const { status, anticipo, formaPago, telefono, fechaEntrega, horaEntrega, notas } = body;

  const pedidoActual = await prisma.pedido.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!pedidoActual) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  let fechaEntregaDate: Date | null = pedidoActual.fechaEntrega;
  if (fechaEntrega !== undefined) {
    if (fechaEntrega && fechaEntrega !== "") {
      const hora = horaEntrega || "12:00";
      fechaEntregaDate = new Date(`${fechaEntrega}T${hora}:00`);
    } else {
      fechaEntregaDate = null;
    }
  }

  const newStatus = getAutoStatus(
    (status as PedidoStatus) ?? pedidoActual.status,
    fechaEntregaDate
  );

  const updated = await prisma.pedido.update({
    where: { id },
    data: {
      status: newStatus,
      anticipo: anticipo !== undefined ? Number(anticipo) : pedidoActual.anticipo,
      formaPago: formaPago ? (formaPago as FormaPago) : pedidoActual.formaPago,
      telefono: telefono !== undefined ? telefono : pedidoActual.telefono,
      fechaEntrega: fechaEntregaDate,
      notas: notas !== undefined ? notas : pedidoActual.notas,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  // Solo ADMIN puede cancelar permanentemente
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    // Empleados solo pueden cancelar (soft delete)
    await prisma.pedido.updateMany({
      where: { id, userId: session.user.id },
      data: { status: "CANCELADO" },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.pedido.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
