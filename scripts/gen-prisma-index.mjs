import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../src/generated/prisma/index.ts");

writeFileSync(
  outPath,
  `// Barrel file para el cliente Prisma 7 generado
// Permite importar desde "@/generated/prisma"
export * from "./client";
export * from "./enums";
export * from "./models";
`
);
console.log("✅ src/generated/prisma/index.ts creado");
