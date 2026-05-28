import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextFolio } from "@/lib/folio";
import { getAutoStatus } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";
import { DEFAULT_STATUS } from "@/lib/productionConfig";

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

type CartItemPayload = {
  categoria: string;
  catLabel: string;
  emoji: string;
  total: number;
  costo: number;
  iva: number;
  formSnapshot: Record<string, unknown>;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const folio = await nextFolio();

  // ── Resolve client (find or create) ──────────────────────────────────────
  async function resolveCliente(
    clienteId: string | null | undefined,
    clienteNombre: string | undefined,
    telefono: string | null | undefined
  ): Promise<string | null> {
    if (clienteId) return clienteId;
    const nombre = (clienteNombre ?? "").trim();
    if (!nombre || nombre === "Sin nombre") return null;

    // Try to find by phone first
    if (telefono?.trim()) {
      const existing = await prisma.cliente.findFirst({
        where: { telefono: { equals: telefono.trim() } },
        select: { id: true },
      });
      if (existing) return existing.id;
    }

    // Create new client
    const created = await prisma.cliente.create({
      data: { nombre, telefono: telefono?.trim() || null },
      select: { id: true },
    });
    return created.id;
  }

  // ── Multi-product cart ────────────────────────────────────────────────────
  if (Array.isArray(body.items) && body.items.length > 0) {
    const { items, clienteNombre, clienteId: rawClienteId, total, costo, iva, fechaEntrega, horaEntrega, telefono, notas } = body as {
      items: CartItemPayload[];
      clienteNombre?: string;
      clienteId?: string | null;
      total: number;
      costo: number;
      iva: number;
      fechaEntrega?: string;
      horaEntrega?: string;
      telefono?: string;
      notas?: string;
    };

    if (!total) return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });

    const resolvedClienteId = await resolveCliente(rawClienteId, clienteNombre, telefono);

    let fechaEntregaDate: Date | null = null;
    if (fechaEntrega) {
      const hora = horaEntrega || "12:00";
      fechaEntregaDate = new Date(`${fechaEntrega}T${hora}:00`);
    }

    const catLabels = items.map((i) => i.catLabel).join(", ");
    const categorias = [...new Set(items.map((i) => i.categoria))].join(",");

    const [cotizacion] = await prisma.$transaction([
      prisma.cotizacion.create({
        data: {
          folio,
          categoria: categorias,
          catLabel: catLabels,
          clienteNombre: clienteNombre || "Sin nombre",
          clienteId: resolvedClienteId,
          total,
          costo,
          iva,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          detalles: JSON.parse(JSON.stringify({ items })),
          userId: session.user.id,
          pedido: {
            create: {
              folio,
              categoria: categorias,
              catLabel: catLabels,
              clienteNombre: clienteNombre || "Sin nombre",
              clienteId: resolvedClienteId,
              total,
              costo,
              iva,
              status: getAutoStatus("PENDIENTE", fechaEntregaDate),
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              detalles: JSON.parse(JSON.stringify({ items })),
              telefono: telefono || null,
              fechaEntrega: fechaEntregaDate,
              notas: notas || null,
              userId: session.user.id,
              items: {
                create: items.map((item) => ({
                  categoria: item.categoria,
                  catLabel: item.catLabel,
                  emoji: item.emoji,
                  total: item.total,
                  costo: item.costo,
                  iva: item.iva,
                  status: DEFAULT_STATUS,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  formSnapshot: JSON.parse(JSON.stringify(item.formSnapshot)),
                  logs: {
                    create: [{ fromStatus: null, toStatus: DEFAULT_STATUS, userId: session.user.id }],
                  },
                })),
              },
            },
          },
        },
      }),
    ]);

    return NextResponse.json(cotizacion, { status: 201 });
  }

  // ── Single product ────────────────────────────────────────────────────────
  const { categoria, catLabel, clienteNombre, clienteId: rawSingleClienteId, total, costo, iva, detalles, fechaEntrega, horaEntrega, telefono, notas } = body;

  if (!categoria || !total) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const resolvedSingleClienteId = await resolveCliente(rawSingleClienteId, clienteNombre, telefono);

  let fechaEntregaDate: Date | null = null;
  if (fechaEntrega) {
    const hora = horaEntrega || "12:00";
    fechaEntregaDate = new Date(`${fechaEntrega}T${hora}:00`);
  }

  const cat = CAT_CONFIG[categoria as keyof typeof CAT_CONFIG];
  const emoji = cat?.emoji ?? "";

  const [cotizacion] = await prisma.$transaction([
    prisma.cotizacion.create({
      data: {
        folio,
        categoria,
        catLabel,
        clienteNombre: clienteNombre || "Sin nombre",
        clienteId: resolvedSingleClienteId,
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
            clienteId: resolvedSingleClienteId,
            total,
            costo,
            iva,
            status: getAutoStatus("PENDIENTE", fechaEntregaDate),
            detalles: detalles ?? {},
            telefono: telefono || null,
            fechaEntrega: fechaEntregaDate,
            notas: notas || null,
            userId: session.user.id,
            items: {
              create: [
                {
                  categoria,
                  catLabel,
                  emoji,
                  total,
                  costo,
                  iva,
                  status: DEFAULT_STATUS,
                  formSnapshot: detalles ?? {},
                  logs: {
                    create: [{ fromStatus: null, toStatus: DEFAULT_STATUS, userId: session.user.id }],
                  },
                },
              ],
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json(cotizacion, { status: 201 });
}
