import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PedidoStatus } from "@/generated/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea número como $1,234 */
export function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

/** Formatea folio como #0001 */
export function folioStr(n: number): string {
  return "#" + String(n).padStart(4, "0");
}

/**
 * Calcula el status automático de un pedido según su fecha de entrega.
 * Migración exacta de getStatus() del HTML original.
 */
export function getAutoStatus(
  manualStatus: PedidoStatus,
  fechaEntrega?: Date | null
): PedidoStatus {
  if (manualStatus === "ENTREGADO" || manualStatus === "CANCELADO") return manualStatus;
  if (manualStatus === "URGENTE" || manualStatus === "LISTO") return manualStatus;
  if (fechaEntrega) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fe = new Date(fechaEntrega);
    fe.setHours(0, 0, 0, 0);
    const diff = (fe.getTime() - hoy.getTime()) / 86_400_000;
    if (diff <= 2 && fe >= hoy) return "PROXIMO";
  }
  return "PENDIENTE";
}

/** Formatea una fecha en español: "lun 12 mayo 14:30" */
export function fmtFecha(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Labels de status para mostrar en UI */
export const STATUS_LABELS: Record<PedidoStatus, string> = {
  PENDIENTE: "Pendiente",
  LISTO: "Listo",
  PROXIMO: "Próximo",
  URGENTE: "Urgente",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Clases Tailwind de color por status */
export const STATUS_CLASSES: Record<PedidoStatus, string> = {
  PENDIENTE:  "bg-yellow-50  text-yellow-800 border-yellow-200",
  LISTO:      "bg-blue-50    text-blue-800   border-blue-200",
  PROXIMO:    "bg-red-50     text-red-800    border-red-200",
  URGENTE:    "bg-purple-50  text-purple-800 border-purple-200",
  ENTREGADO:  "bg-green-50   text-green-800  border-green-200",
  CANCELADO:  "bg-gray-100   text-gray-500   border-gray-200",
};
