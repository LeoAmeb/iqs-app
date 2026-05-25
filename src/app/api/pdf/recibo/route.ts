export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReciboPDF } from "@/lib/pdf/ReciboPDF";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { pedidoId } = await req.json();
  if (!pedidoId) {
    return NextResponse.json({ error: "pedidoId requerido" }, { status: 400 });
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
  });

  if (!pedido) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const detalles = pedido.detalles as Record<string, unknown>;

  const fecha = pedido.createdAt.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let fechaEntrega: string | null = null;
  if (pedido.fechaEntrega) {
    const fe = new Date(pedido.fechaEntrega);
    const d = String(fe.getDate()).padStart(2, "0");
    const m = String(fe.getMonth() + 1).padStart(2, "0");
    const y = fe.getFullYear();
    fechaEntrega = `${d}/${m}/${y}`;
  }

  const saldo = pedido.total - pedido.anticipo;

  const element = React.createElement(ReciboPDF, {
    folio: pedido.folio,
    fecha,
    catLabel: pedido.catLabel,
    clienteNombre: pedido.clienteNombre,
    total: pedido.total,
    anticipo: pedido.anticipo,
    saldo: Math.max(0, saldo),
    formaPago: pedido.formaPago ?? null,
    fechaEntrega,
    horaEntrega: (detalles.horaEntrega as string | null) ?? null,
    notas: pedido.notas ?? null,
  });

  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recibo-${String(pedido.folio).padStart(4, "0")}.pdf"`,
    },
  });
}
