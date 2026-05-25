import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const mesParam = searchParams.get("mes"); // "2025-05"

  let y: number, m: number;
  if (mesParam) {
    [y, m] = mesParam.split("-").map(Number);
  } else {
    const now = new Date();
    y = now.getFullYear();
    m = now.getMonth() + 1;
  }

  const inicio = new Date(y, m - 1, 1);
  const fin = new Date(y, m, 1);

  const pedidos = await prisma.pedido.findMany({
    where: {
      userId: session.user.id,
      status: { not: "CANCELADO" },
      createdAt: { gte: inicio, lt: fin },
    },
    select: {
      total: true, costo: true, iva: true,
      status: true, catLabel: true,
      anticipo: true, fechaEntrega: true, clienteNombre: true,
    },
  });

  const ventasMes = pedidos.reduce((a, p) => a + p.total, 0);
  const tickets = pedidos.length;
  const ticketProm = tickets > 0 ? ventasMes / tickets : 0;
  const costos = pedidos.reduce((a, p) => a + p.costo, 0);
  const ivas = pedidos.reduce((a, p) => a + (p.iva || p.total / 1.16 * 0.16), 0);
  const ganancia = ventasMes - costos - ivas;
  const margen = ventasMes > 0 ? (ganancia / ventasMes) * 100 : 0;

  // Config del usuario
  const config = await prisma.configuracion.findUnique({
    where: { userId: session.user.id },
  });
  const meta = config?.metaMensual ?? 20000;

  // Breakdown por categoría
  const catMap: Record<string, { ventas: number; cantidad: number }> = {};
  for (const p of pedidos) {
    const lbl = p.catLabel;
    if (!catMap[lbl]) catMap[lbl] = { ventas: 0, cantidad: 0 };
    catMap[lbl].ventas += p.total;
    catMap[lbl].cantidad += 1;
  }
  const porCategoria = Object.entries(catMap)
    .map(([cat, v]) => ({ cat, ...v }))
    .sort((a, b) => b.ventas - a.ventas);

  // Entregas próximas (hoy y mañana)
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
  const pasadomanana = new Date(hoy); pasadomanana.setDate(pasadomanana.getDate() + 2);

  const entregasProximas = await prisma.pedido.findMany({
    where: {
      userId: session.user.id,
      status: { notIn: ["ENTREGADO", "CANCELADO"] },
      fechaEntrega: { gte: hoy, lt: pasadomanana },
    },
    select: { id: true, clienteNombre: true, catLabel: true, fechaEntrega: true, status: true, total: true },
    orderBy: { fechaEntrega: "asc" },
  });

  // Saldo pendiente
  const pedidosActivos = await prisma.pedido.findMany({
    where: { userId: session.user.id, status: { notIn: ["ENTREGADO", "CANCELADO"] } },
    select: { total: true, anticipo: true },
  });
  const saldoPendiente = pedidosActivos.reduce((a, p) => a + (p.total - p.anticipo), 0);
  const cantActivos = pedidosActivos.length;

  return NextResponse.json({
    mes: `${y}-${String(m).padStart(2, "0")}`,
    ventasMes, tickets, ticketProm,
    costos, ivas, ganancia, margen,
    meta, metaPct: ventasMes / meta * 100,
    porCategoria,
    entregasProximas,
    saldoPendiente,
    cantActivos,
  });
}
