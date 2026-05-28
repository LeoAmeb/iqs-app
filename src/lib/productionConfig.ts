export interface ProductionStage {
  id: string;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const PRODUCTION_STAGES: ProductionStage[] = [
  {
    id: "Pendiente",
    label: "Pendiente",
    color: "#64748b",
    bgClass: "bg-slate-100 dark:bg-slate-800",
    textClass: "text-slate-600 dark:text-slate-300",
  },
  {
    id: "En producción",
    label: "En producción",
    color: "#f59e0b",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  {
    id: "Listo",
    label: "Listo",
    color: "#22c55e",
    bgClass: "bg-green-100 dark:bg-green-900/30",
    textClass: "text-green-700 dark:text-green-400",
  },
  {
    id: "Entregado",
    label: "Entregado",
    color: "#6366f1",
    bgClass: "bg-indigo-100 dark:bg-indigo-900/30",
    textClass: "text-indigo-700 dark:text-indigo-400",
  },
];

export const DEFAULT_STATUS = PRODUCTION_STAGES[0].id;

export function getStage(id: string): ProductionStage {
  return PRODUCTION_STAGES.find((s) => s.id === id) ?? PRODUCTION_STAGES[0];
}

export function getNextStage(currentId: string): ProductionStage | null {
  const idx = PRODUCTION_STAGES.findIndex((s) => s.id === currentId);
  return idx >= 0 && idx < PRODUCTION_STAGES.length - 1
    ? PRODUCTION_STAGES[idx + 1]
    : null;
}
