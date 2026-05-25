// ─── Tipos base del engine de pricing ────────────────────────────────────────

export interface DesgloseRow {
  label: string;
  val: number;
}

export interface CalcResult {
  rows: DesgloseRow[];
  total: number;
  costo: number;
  iva: number;       // total / 1.16 * 0.16
  neto: number;      // total - iva
  ganancia: number;  // total - costo - iva
  margen: number;    // ganancia / total * 100
}

export interface UserConfig {
  horaObjetivo: number; // default 230
  horaLaser: number;    // default 30
}

// ─── Parámetros por categoría ─────────────────────────────────────────────────

export interface LogosParams {
  tipo: "base" | "sinbase_a" | "sinbase_b";
  // Con base
  tamano?: number;        // precio base (1590, 2090, 3490, 3990)
  cantidad?: number;
  chapeton?: "plateado" | "dorado";
  terceraCapa?: boolean;
  colorTercera?: string;
  led?: boolean;
  colorLed?: string;
  instalacion?: boolean;
  urgente?: boolean;
  mismodia?: boolean;
  colorBase?: string;
  colorDiseno?: string;
  // Sin base
  ancho?: number;
  alto?: number;
  cantidad_sb?: number;
  instalacion_sb?: boolean;
  urgente_sb?: boolean;
  mismodia_sb?: boolean;
  // Común
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface NeonParams {
  tipo: number;           // precio base (1050, 1700, 2800, 3900)
  complejidad: number;    // (0, 400, 600)
  metraje: "normal" | "medio" | "largo";
  chapeton: "plateado" | "dorado";
  apagador?: boolean;
  instalacion?: boolean;
  urgente?: boolean;
  mismodia?: boolean;
  cantidad: number;
  colorPrincipal?: string;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface ToppersParams {
  tamano: 15 | 12;        // 15cm o 10-12cm
  tipoCliente: "nuevo" | "frecuente";
  extra: 0 | 50 | 60;
  urgente?: boolean;
  cantidad: number;
  color?: string;
  nombre?: string;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface BaseItem {
  medida: string; // "12x12", "16x16", etc.
  cant: number;
}

export interface MdfParams {
  subtipo: "nombres" | "bases" | "llaveros" | "manual";
  // Nombres
  tamNombres?: number;    // precio base (150, 260)
  cantNombres?: number;
  acabado?: "natural" | "pintado";
  vinilMetros?: number;
  // Bases
  materialBases?: "3mm" | "6mm" | "6blanco";
  basesItems?: BaseItem[];
  // Llaveros
  cantLlaveros?: number;
  // Manual
  precioManual?: number;
  costoManual?: number;
  notasManual?: string;
  // Extras comunes
  urgente?: boolean;
  mismodia?: boolean;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface TermosParams {
  termoPropio: boolean;
  // Si propio
  propioTipo?: "solo_1" | "solo_2" | "mayoreo_corto" | "mayoreo_nombre";
  // Si nuestro
  tamano?: 20 | 30;
  color?: string;
  mayoreo?: 0 | 5 | 10;
  cantidad: number;
  urgente?: boolean;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface DisplaysParams {
  tipo: number | "custom";  // precio (600, 700, 800, 950) o "custom"
  precioLibre?: number;
  costoLibre?: number;
  cantidad: number;
  terceraCapa?: boolean;
  urgente?: boolean;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface GrabadoParams {
  tipoCliente: "nuevo" | "frecuente";
  tam: "pequeno" | "mediano" | "grande";
  precio: number;           // precio seleccionado de la tabla
  cantidad: number;
  objeto?: string;
  urgente?: boolean;
  mismodia?: boolean;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface CorteParams {
  material: "acrilico" | "mdf";
  ancho: number;
  alto: number;
  cantidad: number;
  urgente?: boolean;
  mismodia?: boolean;
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}

export interface PersonalizadoParams {
  horas: number;
  materiales: number;
  extras: number;
  margenExtra: number;    // porcentaje
  cliente?: string;
  fechaEntrega?: string;
  horaEntrega?: string;
  notas?: string;
}
