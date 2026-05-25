import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const filtro = searchParams.get("filtro") ?? "todos"; // todos | activos | entregados
  const mes = searchParams.get("mes");

  const where: Record<string, unknown> = { userId: session.user.id };

  if (filtro === "activos") {
    where.status = { notIn: ["ENTREGADO", "CANCELADO"] };
  } else if (filtro === "entregados") {
    where.status = "ENTREGADO";
  }

  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    where.createdAt = {
      gte: new Date(y, m - 1, 1),
      lt: new Date(y, m, 1),
    };
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { cliente: { select: { nombre: true, telefono: true } } },
  });

  return NextResponse.json(pedidos);
}
