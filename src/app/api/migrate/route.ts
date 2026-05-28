import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAutoStatus } from "@/lib/utils";
import { PedidoStatus, FormaPago } from "@/generated/prisma/client";

// Tipos del formato legacy (HTML original)
interface LegacyPedido {
  folio: number;
  fecha: string; // "DD/MM/YYYY"
  cat: string;
  catLabel: string;
  cliente: string;
  total: number;
  costo: number;
  iva?: number;
  status: string;
  anticipo?: number;
  formaPago?: string;
  telefono?: string;
  fechaEntrega?: string; // "YYYY-MM-DD"
  horaEntrega?: string;  // "HH:MM"
  notas?: string;
  detalles?: string;
}

function parseFechaLegacy(fechaStr: string): Date {
  // Formato: "DD/MM/YYYY"
  const parts = fechaStr.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date();
}

function mapStatus(s: string): PedidoStatus {
  const map: Record<string, PedidoStatus> = {
    pendiente: "PENDIENTE",
    listo:     "LISTO",
    proximo:   "PROXIMO",
    urgente:   "URGENTE",
    entregado: "ENTREGADO",
    cancelado: "CANCELADO",
  };
  return map[s?.toLowerCase()] ?? "PENDIENTE";
}

function mapFormaPago(f: string): FormaPago | null {
  const map: Record<string, FormaPago> = {
    efectivo:      "EFECTIVO",
    transferencia: "TRANSFERENCIA",
    tarjeta:       "TARJETA",
  };
  return map[f?.toLowerCase()] ?? null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { pedidos = [] }: { pedidos: LegacyPedido[] } = body;

  // Obtener folios ya existentes para evitar duplicados
  const existingFolios = new Set(
    (await prisma.pedido.findMany({ select: { folio: true } })).map((p) => p.folio)
  );

  let imported = 0;
  let skipped = 0;

  for (const p of pedidos) {
    if (!p.folio || existingFolios.has(p.folio)) {
      skipped++;
      continue;
    }

    let fechaEntregaDate: Date | null = null;
    if (p.fechaEntrega) {
      const hora = p.horaEntrega || "12:00";
      fechaEntregaDate = new Date(`${p.fechaEntrega}T${hora}:00`);
    }

    const status = mapStatus(p.status);
    const autoStatus = getAutoStatus(status, fechaEntregaDate);

    try {
      await prisma.$transaction([
        prisma.cotizacion.create({
          data: {
            folio: p.folio,
            fecha: parseFechaLegacy(p.fecha),
            categoria: p.cat,
            catLabel: p.catLabel,
            clienteNombre: p.cliente || "Sin nombre",
            total: p.total,
            costo: p.costo,
            iva: p.iva ?? p.total / 1.16 * 0.16,
            detalles: { legacy: true, text: p.detalles || "" },
            userId: session.user.id,
            createdAt: parseFechaLegacy(p.fecha),
          },
        }),
        prisma.pedido.create({
          data: {
            folio: p.folio,
            categoria: p.cat,
            catLabel: p.catLabel,
            clienteNombre: p.cliente || "Sin nombre",
            total: p.total,
            costo: p.costo,
            iva: p.iva ?? p.total / 1.16 * 0.16,
            status: autoStatus,
            anticipo: p.anticipo ?? 0,
            formaPago: p.formaPago ? mapFormaPago(p.formaPago) : null,
            telefono: p.telefono || null,
            fechaEntrega: fechaEntregaDate,
            notas: p.notas || null,
            detalles: { legacy: true, text: p.detalles || "" },
            userId: session.user.id,
            createdAt: parseFechaLegacy(p.fecha),
          },
        }),
      ]);
      existingFolios.add(p.folio);
      imported++;
    } catch {
      skipped++;
    }
  }

  // Actualizar el contador de folios al máximo importado + 1
  const maxFolio = await prisma.pedido.aggregate({ _max: { folio: true } });
  const nextFolio = (maxFolio._max.folio ?? 0) + 1;
  await prisma.folioCounter.upsert({
    where: { id: "singleton" },
    update: { current: nextFolio },
    create: { id: "singleton", current: nextFolio },
  });

  return NextResponse.json({ ok: true, imported, skipped });
}
