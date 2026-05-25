export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CotizacionPDF } from "@/lib/pdf/CotizacionPDF";
import { calcDesglose } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { cotizacionId } = await req.json();
  if (!cotizacionId) {
    return NextResponse.json({ error: "cotizacionId requerido" }, { status: 400 });
  }

  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id: cotizacionId },
  });

  if (!cotizacion) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  // Re-compute desglose metrics from stored values
  const desglose = calcDesglose([], cotizacion.total, cotizacion.costo);

  const detalles = cotizacion.detalles as Record<string, unknown>;

  const fecha = cotizacion.fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const fechaEntrega = detalles.fechaEntrega
    ? (() => {
        const [y, m, d] = (detalles.fechaEntrega as string).split("-");
        return `${d}/${m}/${y}`;
      })()
    : null;

  // Build rows from detalles if available, else show a single summary row
  const rows =
    Array.isArray(detalles.rows)
      ? (detalles.rows as { label: string; val: number }[])
      : [{ label: cotizacion.catLabel, val: cotizacion.total }];

  const element = React.createElement(CotizacionPDF, {
    folio: cotizacion.folio,
    fecha,
    catLabel: cotizacion.catLabel,
    clienteNombre: cotizacion.clienteNombre,
    rows,
    total: cotizacion.total,
    costo: cotizacion.costo,
    iva: cotizacion.iva,
    ganancia: desglose.ganancia,
    margen: desglose.margen,
    fechaEntrega,
    horaEntrega: (detalles.horaEntrega as string | null) ?? null,
    notas: (detalles.notas as string | null) ?? null,
  });

  const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cotizacion-${String(cotizacion.folio).padStart(4, "0")}.pdf"`,
    },
  });
}
