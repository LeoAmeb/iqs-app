import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search")?.trim() ?? "";

  const clientes = await prisma.cliente.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { telefono: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { pedidos: true } },
    },
  });

  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { nombre, telefono, email, notas } = body;

  if (!nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const cliente = await prisma.cliente.create({
    data: {
      nombre: nombre.trim(),
      telefono: telefono?.trim() || null,
      email: email?.trim() || null,
      notas: notas?.trim() || null,
    },
  });

  return NextResponse.json(cliente, { status: 201 });
}
