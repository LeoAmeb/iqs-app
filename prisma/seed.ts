import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Usuario admin por defecto
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@iqs.mx" },
    update: {},
    create: {
      name: "Admin IQS",
      email: "admin@iqs.mx",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Configuración por defecto para el admin
  await prisma.configuracion.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      horaObjetivo: 230,
      horaLaser: 30,
      metaMensual: 20000,
    },
  });

  // Inicializar el contador de folios
  await prisma.folioCounter.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", current: 1 },
  });

  console.log("✅ Usuario admin creado:", admin.email);
  console.log("📧 Email: admin@iqs.mx");
  console.log("🔑 Password: admin123");
  console.log("\n⚠️  Cambia la contraseña después del primer login!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
