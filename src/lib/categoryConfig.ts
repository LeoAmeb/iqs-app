export type Category =
  | "logos"
  | "neon"
  | "toppers"
  | "mdf"
  | "termos"
  | "displays"
  | "grabado"
  | "corte"
  | "personalizado";

export const CATEGORIES: Category[] = [
  "logos",
  "neon",
  "toppers",
  "mdf",
  "termos",
  "displays",
  "grabado",
  "corte",
  "personalizado",
];

export interface CatConfig {
  label: string;
  description: string;
  color: string;
  bg: string;
  formBgClass: string;
  icon: string;
  emoji: string;
}

export const CAT_CONFIG: Record<Category, CatConfig> = {
  logos: {
    label: "Logo Acrílico",
    description: "Con o sin base acrílica",
    color: "#5b21b6",
    bg: "#f5f3ff",
    formBgClass: "bg-violet-50 dark:bg-violet-950/20",
    icon: "tag",
    emoji: "🏷",
  },
  neon: {
    label: "Letrero Neon",
    description: "Letreros LED personalizados",
    color: "#be185d",
    bg: "#fdf2f8",
    formBgClass: "bg-pink-50 dark:bg-pink-950/20",
    icon: "bulb",
    emoji: "💡",
  },
  toppers: {
    label: "Toppers",
    description: "Acrílico para pasteles y eventos",
    color: "#c2410c",
    bg: "#fff7ed",
    formBgClass: "bg-orange-50 dark:bg-orange-950/20",
    icon: "cake",
    emoji: "🎂",
  },
  mdf: {
    label: "Corte MDF",
    description: "Letras, bases y llaveros",
    color: "#166534",
    bg: "#f0fdf4",
    formBgClass: "bg-green-50 dark:bg-green-950/20",
    icon: "cut",
    emoji: "✂️",
  },
  termos: {
    label: "Termos Grabados",
    description: "Termos sublimados personalizados",
    color: "#075985",
    bg: "#f0f9ff",
    formBgClass: "bg-sky-50 dark:bg-sky-950/20",
    icon: "coffee",
    emoji: "☕",
  },
  displays: {
    label: "Displays",
    description: "Displays acrílicos para exhibición",
    color: "#9d174d",
    bg: "#fdf2f8",
    formBgClass: "bg-rose-50 dark:bg-rose-950/20",
    icon: "layout-board",
    emoji: "🖼",
  },
  grabado: {
    label: "Grabado Láser",
    description: "Grabado sobre objetos del cliente",
    color: "#92400e",
    bg: "#fffbeb",
    formBgClass: "bg-amber-50 dark:bg-amber-950/20",
    icon: "writing",
    emoji: "✍️",
  },
  corte: {
    label: "Corte Simple",
    description: "Corte láser en acrílico o MDF",
    color: "#134e4a",
    bg: "#f0fdfa",
    formBgClass: "bg-teal-50 dark:bg-teal-950/20",
    icon: "scissors",
    emoji: "✂",
  },
  personalizado: {
    label: "Trabajo Libre",
    description: "Cotización por horas y materiales",
    color: "#374151",
    bg: "#f9fafb",
    formBgClass: "bg-zinc-50 dark:bg-zinc-900/50",
    icon: "adjustments-horizontal",
    emoji: "⚙️",
  },
};
