import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextFolio } from "@/lib/folio";
import { getAutoStatus } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const mes = searchParams.get("mes"); // "2025-05"
  const categoria = searchParams.get("categoria");
  const page = Number(searchParams.get("page") || 1);
  const limit = 20;

  const where: Record<string, unknown> = { userId: session.user.id };
  if (categoria) where.categoria = categoria;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    where.createdAt = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    };
  }

  const [items, total] = await Promise.all([
    prisma.cotizacion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { cliente: { select: { nombre: true } } },
    }),
    prisma.cotizacion.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { categoria, catLabel, clienteNombre, clienteId, total, costo, iva, detalles, fechaEntrega, horaEntrega, telefono, notas } = body;

  if (!categoria || !total) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const folio = await nextFolio();

  // Calcular fecha de entrega
  let fechaEntregaDate: Date | null = null;
  if (fechaEntrega) {
    const hora = horaEntrega || "12:00";
    fechaEntregaDate = new Date(`${fechaEntrega}T${hora}:00`);
  }

  // Crear cotización + pedido en una sola transacción
  const [cotizacion] = await prisma.$transaction([
    prisma.cotizacion.create({
      data: {
        folio,
        categoria,
        catLabel,
        clienteNombre: clienteNombre || "Sin nombre",
        clienteId: clienteId || null,
        total,
        costo,
        iva,
        detalles: detalles ?? {},
        userId: session.user.id,
        pedido: {
          create: {
            folio,
            categoria,
            catLabel,
            clienteNombre: clienteNombre || "Sin nombre",
            clienteId: clienteId || null,
            total,
            costo,
            iva,
            status: getAutoStatus("PENDIENTE", fechaEntregaDate),
            detalles: detalles ?? {},
            telefono: telefono || null,
            fechaEntrega: fechaEntregaDate,
            notas: notas || null,
            userId: session.user.id,
          },
        },
      },
    }),
  ]);

  return NextResponse.json(cotizacion, { status: 201 });
}
