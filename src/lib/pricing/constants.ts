// ─── Constantes del engine de pricing ─────────────────────────────────────────
// Migración exacta de las variables hardcodeadas del HTML original

export type MdfMaterial = "3mm" | "6mm" | "6blanco";
export type BaseMedida = "12x12" | "16x16" | "22x22" | "25x25" | "28x28" | "30x30";

/** Precios mayoreo (≥20 piezas) de bases MDF */
export const BASES_V: Record<MdfMaterial, Record<BaseMedida, number>> = {
  "3mm":    { "12x12": 10, "16x16": 12, "22x22": 16, "25x25": 18, "28x28": 22, "30x30": 25 },
  "6mm":    { "12x12": 18, "16x16": 22, "22x22": 28, "25x25": 32, "28x28": 40, "30x30": 44 },
  "6blanco":{ "12x12": 20, "16x16": 24, "22x22": 32, "25x25": 36, "28x28": 44, "30x30": 50 },
};

/** Precios menudeo (<20 piezas) de bases MDF */
export const BASES_MINI: Record<MdfMaterial, Record<BaseMedida, number>> = {
  "3mm":    { "12x12": 16, "16x16": 18, "22x22": 24, "25x25": 28, "28x28": 34, "30x30": 38 },
  "6mm":    { "12x12": 28, "16x16": 34, "22x22": 42, "25x25": 48, "28x28": 60, "30x30": 66 },
  "6blanco":{ "12x12": 30, "16x16": 36, "22x22": 48, "25x25": 54, "28x28": 66, "30x30": 76 },
};

/** Área en cm² por medida de base */
export const BASES_CM2: Record<BaseMedida, number> = {
  "12x12": 144,
  "16x16": 256,
  "22x22": 484,
  "25x25": 625,
  "28x28": 784,
  "30x30": 900,
};

/** Costo por cm² según material */
export const MDF_CM2C: Record<MdfMaterial, number> = {
  "3mm":    0.006,
  "6mm":    0.0084,
  "6blanco":0.0094,
};

/** Tamaño en cm de cada logo por precio base */
export const LOGO_TAMANOS: Record<number, number> = {
  1590: 50,
  2090: 60,
  3490: 80,
  3990: 90,
};

/** Tabla de precios de grabado láser por tipo cliente y tamaño */
export const GRABADO_PRECIOS: Record<string, Record<string, number[]>> = {
  nuevo:    { pequeno: [100, 120], mediano: [150, 200], grande: [250] },
  frecuente:{ pequeno: [60, 80],   mediano: [100, 150], grande: [180] },
};

/** Metraje extra neon en metros */
export const NEON_METROS: Record<string, number> = {
  normal: 4,
  medio:  7,
  largo:  10,
};

/** Recargo extra por metraje neon */
export const NEON_METRAJE_EXTRA: Record<string, number> = {
  normal: 0,
  medio:  250,
  largo:  350,
};

export const MEDIDAS_MDF: BaseMedida[] = [
  "12x12", "16x16", "22x22", "25x25", "28x28", "30x30",
];
