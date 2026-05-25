import { prisma } from "@/lib/prisma";

/**
 * Devuelve el siguiente folio disponible de forma atómica.
 * Usa el modelo FolioCounter con upsert + incremento.
 */
export async function nextFolio(): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.folioCounter.upsert({
      where: { id: "singleton" },
      update: { current: { increment: 1 } },
      create: { id: "singleton", current: 2 },
    });
    return counter.current - 1; // el valor previo al incremento
  });
  return result;
}

/** Formatea un número de folio como #0001 */
export function folioStr(n: number): string {
  return "#" + String(n).padStart(4, "0");
}
