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
  color: string;
  bg: string;
  icon: string; // Tabler icon name
}

export const CAT_CONFIG: Record<Category, CatConfig> = {
  logos: {
    label: "Logo Acrílico",
    color: "#5b21b6",
    bg: "#f5f3ff",
    icon: "tag",
  },
  neon: {
    label: "Letrero Neon",
    color: "#be185d",
    bg: "#fdf2f8",
    icon: "bulb",
  },
  toppers: {
    label: "Toppers",
    color: "#c2410c",
    bg: "#fff7ed",
    icon: "cake",
  },
  mdf: {
    label: "Corte MDF",
    color: "#166534",
    bg: "#f0fdf4",
    icon: "cut",
  },
  termos: {
    label: "Termos Grabados",
    color: "#075985",
    bg: "#f0f9ff",
    icon: "coffee",
  },
  displays: {
    label: "Displays",
    color: "#9d174d",
    bg: "#fdf2f8",
    icon: "layout-board",
  },
  grabado: {
    label: "Grabado Láser",
    color: "#92400e",
    bg: "#fffbeb",
    icon: "writing",
  },
  corte: {
    label: "Corte Simple",
    color: "#134e4a",
    bg: "#f0fdfa",
    icon: "scissors",
  },
  personalizado: {
    label: "Trabajo Libre",
    color: "#374151",
    bg: "#f9fafb",
    icon: "adjustments-horizontal",
  },
};
