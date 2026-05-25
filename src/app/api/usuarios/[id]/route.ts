import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

// PATCH /api/usuarios/[id] — actualizar usuario
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as {
    name?: string;
    role?: string;
    active?: boolean;
    password?: string;
  };

  // Un admin no puede desactivarse a sí mismo
  if (body.active === false && id === session.user.id) {
    return NextResponse.json(
      { error: "No puedes desactivar tu propia cuenta" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.role !== undefined)
    data.role = body.role === "ADMIN" ? "ADMIN" : "EMPLEADO";
  if (body.active !== undefined) data.active = body.active;
  if (body.password) data.password = await bcrypt.hash(body.password, 12);

  try {
    const usuario = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { pedidos: true, cotizaciones: true } },
      },
    });
    return NextResponse.json(usuario);
  } catch {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
}

// DELETE /api/usuarios/[id] — eliminar usuario (si no tiene registros)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propia cuenta" },
      { status: 400 }
    );
  }

  // Si tiene pedidos o cotizaciones → solo desactivar
  const counts = await prisma.user.findUnique({
    where: { id },
    select: { _count: { select: { pedidos: true, cotizaciones: true } } },
  });

  if (!counts) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const total = counts._count.pedidos + counts._count.cotizaciones;

  if (total > 0) {
    // Soft delete
    const u = await prisma.user.update({
      where: { id },
      data: { active: false },
      select: { id: true, active: true },
    });
    return NextResponse.json({ ...u, softDeleted: true });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
