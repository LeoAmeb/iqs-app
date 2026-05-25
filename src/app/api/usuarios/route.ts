import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** Solo ADMIN puede acceder */
async function requireAdmin() {
  const session = await auth();
  if (!session) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

// GET /api/usuarios — lista todos los usuarios
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      _count: {
        select: { pedidos: true, cotizaciones: true },
      },
    },
  });

  return NextResponse.json(usuarios);
}

// POST /api/usuarios — crear nuevo usuario
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, password, role } = body as {
    name: string;
    email: string;
    password: string;
    role?: string;
  };

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json(
      { error: "name, email y password son requeridos" },
      { status: 400 }
    );
  }

  // Verificar email único
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese email" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const usuario = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "EMPLEADO",
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(usuario, { status: 201 });
}
