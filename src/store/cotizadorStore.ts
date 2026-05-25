"use client";
import { create } from "zustand";
import { CalcResult, BaseItem } from "@/lib/pricing/types";
import { Category } from "@/lib/categoryConfig";

// ─── Interfaces de estado por categoría ──────────────────────────────────────

interface LogosState {
  tipo: "base" | "sinbase_a" | "sinbase_b";
  tamano: number;
  cantidad: number;
  chapeton: "plateado" | "dorado";
  terceraCapa: boolean;
  colorTercera: string;
  led: boolean;
  colorLed: string;
  instalacion: boolean;
  urgente: boolean;
  mismodia: boolean;
  colorBase: string;
  colorDiseno: string;
  ancho: number;
  alto: number;
  cantidad_sb: number;
  instalacion_sb: boolean;
  urgente_sb: boolean;
  mismodia_sb: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface NeonState {
  tipo: number;
  complejidad: number;
  metraje: "normal" | "medio" | "largo";
  chapeton: "plateado" | "dorado";
  apagador: boolean;
  instalacion: boolean;
  urgente: boolean;
  mismodia: boolean;
  cantidad: number;
  colorPrincipal: string;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface ToppersState {
  tamano: 15 | 12;
  tipoCliente: "nuevo" | "frecuente";
  extra: 0 | 50 | 60;
  urgente: boolean;
  cantidad: number;
  color: string;
  nombre: string;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface MdfState {
  subtipo: "nombres" | "bases" | "llaveros" | "manual";
  tamNombres: number;
  cantNombres: number;
  acabado: "natural" | "pintado";
  vinilMetros: number;
  materialBases: "3mm" | "6mm" | "6blanco";
  basesItems: BaseItem[];
  cantLlaveros: number;
  precioManual: number;
  costoManual: number;
  notasManual: string;
  urgente: boolean;
  mismodia: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface TermosState {
  termoPropio: boolean;
  propioTipo: "solo_1" | "solo_2" | "mayoreo_corto" | "mayoreo_nombre";
  tamano: 20 | 30;
  color: string;
  mayoreo: 0 | 5 | 10;
  cantidad: number;
  urgente: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface DisplaysState {
  tipo: number | "custom";
  precioLibre: number;
  costoLibre: number;
  cantidad: number;
  terceraCapa: boolean;
  urgente: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface GrabadoState {
  tipoCliente: "nuevo" | "frecuente";
  tam: "pequeno" | "mediano" | "grande";
  precio: number;
  cantidad: number;
  objeto: string;
  urgente: boolean;
  mismodia: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface CorteState {
  material: "acrilico" | "mdf";
  ancho: number;
  alto: number;
  cantidad: number;
  urgente: boolean;
  mismodia: boolean;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

interface PersonalizadoState {
  horas: number;
  materiales: number;
  extras: number;
  margenExtra: number;
  cliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
}

// ─── Store completo ───────────────────────────────────────────────────────────

interface CotizadorStore {
  currentCat: Category;
  lastResult: CalcResult | null;
  logos: LogosState;
  neon: NeonState;
  toppers: ToppersState;
  mdf: MdfState;
  termos: TermosState;
  displays: DisplaysState;
  grabado: GrabadoState;
  corte: CorteState;
  personalizado: PersonalizadoState;

  setCategory: (cat: Category) => void;
  setLastResult: (result: CalcResult | null) => void;
  updateLogos: (partial: Partial<LogosState>) => void;
  updateNeon: (partial: Partial<NeonState>) => void;
  updateToppers: (partial: Partial<ToppersState>) => void;
  updateMdf: (partial: Partial<MdfState>) => void;
  updateTermos: (partial: Partial<TermosState>) => void;
  updateDisplays: (partial: Partial<DisplaysState>) => void;
  updateGrabado: (partial: Partial<GrabadoState>) => void;
  updateCorte: (partial: Partial<CorteState>) => void;
  updatePersonalizado: (partial: Partial<PersonalizadoState>) => void;
  addBase: () => void;
  removeBase: (index: number) => void;
  updateBase: (index: number, partial: Partial<BaseItem>) => void;
  resetCurrentForm: () => void;
}

// ─── Valores por defecto ──────────────────────────────────────────────────────

const defaultLogos: LogosState = {
  tipo: "base", tamano: 1590, cantidad: 1, chapeton: "plateado",
  terceraCapa: false, colorTercera: "Oro", led: false, colorLed: "Blanco frío",
  instalacion: false, urgente: false, mismodia: false,
  colorBase: "Transparente", colorDiseno: "Oro",
  ancho: 100, alto: 40, cantidad_sb: 1,
  instalacion_sb: false, urgente_sb: false, mismodia_sb: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultNeon: NeonState = {
  tipo: 1700, complejidad: 0, metraje: "normal", chapeton: "plateado",
  apagador: false, instalacion: false, urgente: false, mismodia: false,
  cantidad: 1, colorPrincipal: "Blanco frío",
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultToppers: ToppersState = {
  tamano: 15, tipoCliente: "nuevo", extra: 0, urgente: false,
  cantidad: 1, color: "Oro", nombre: "",
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultMdf: MdfState = {
  subtipo: "nombres", tamNombres: 150, cantNombres: 1,
  acabado: "natural", vinilMetros: 0,
  materialBases: "3mm", basesItems: [{ medida: "12x12", cant: 1 }],
  cantLlaveros: 20, precioManual: 0, costoManual: 0, notasManual: "",
  urgente: false, mismodia: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultTermos: TermosState = {
  termoPropio: false, propioTipo: "solo_1", tamano: 20,
  color: "Negro", mayoreo: 0, cantidad: 1, urgente: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultDisplays: DisplaysState = {
  tipo: 600, precioLibre: 0, costoLibre: 0,
  cantidad: 1, terceraCapa: false, urgente: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultGrabado: GrabadoState = {
  tipoCliente: "nuevo", tam: "pequeno", precio: 100,
  cantidad: 1, objeto: "", urgente: false, mismodia: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultCorte: CorteState = {
  material: "acrilico", ancho: 30, alto: 30, cantidad: 1,
  urgente: false, mismodia: false,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

const defaultPersonalizado: PersonalizadoState = {
  horas: 2, materiales: 0, extras: 0, margenExtra: 0,
  cliente: "", fechaEntrega: "", horaEntrega: "", notas: "",
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCotizadorStore = create<CotizadorStore>((set, get) => ({
  currentCat: "logos",
  lastResult: null,
  logos: defaultLogos,
  neon: defaultNeon,
  toppers: defaultToppers,
  mdf: defaultMdf,
  termos: defaultTermos,
  displays: defaultDisplays,
  grabado: defaultGrabado,
  corte: defaultCorte,
  personalizado: defaultPersonalizado,

  setCategory: (cat) => set({ currentCat: cat }),
  setLastResult: (result) => set({ lastResult: result }),

  updateLogos: (partial) => set((s) => ({ logos: { ...s.logos, ...partial } })),
  updateNeon: (partial) => set((s) => ({ neon: { ...s.neon, ...partial } })),
  updateToppers: (partial) => set((s) => ({ toppers: { ...s.toppers, ...partial } })),
  updateMdf: (partial) => set((s) => ({ mdf: { ...s.mdf, ...partial } })),
  updateTermos: (partial) => set((s) => ({ termos: { ...s.termos, ...partial } })),
  updateDisplays: (partial) => set((s) => ({ displays: { ...s.displays, ...partial } })),
  updateGrabado: (partial) => set((s) => ({ grabado: { ...s.grabado, ...partial } })),
  updateCorte: (partial) => set((s) => ({ corte: { ...s.corte, ...partial } })),
  updatePersonalizado: (partial) => set((s) => ({ personalizado: { ...s.personalizado, ...partial } })),

  addBase: () =>
    set((s) => ({
      mdf: {
        ...s.mdf,
        basesItems: [...s.mdf.basesItems, { medida: "12x12", cant: 1 }],
      },
    })),
  removeBase: (index) =>
    set((s) => ({
      mdf: {
        ...s.mdf,
        basesItems: s.mdf.basesItems.filter((_, i) => i !== index),
      },
    })),
  updateBase: (index, partial) =>
    set((s) => ({
      mdf: {
        ...s.mdf,
        basesItems: s.mdf.basesItems.map((b, i) =>
          i === index ? { ...b, ...partial } : b
        ),
      },
    })),

  resetCurrentForm: () => {
    const cat = get().currentCat;
    const defaults: Record<Category, unknown> = {
      logos: defaultLogos, neon: defaultNeon, toppers: defaultToppers,
      mdf: defaultMdf, termos: defaultTermos, displays: defaultDisplays,
      grabado: defaultGrabado, corte: defaultCorte, personalizado: defaultPersonalizado,
    };
    set({ [cat]: defaults[cat], lastResult: null });
  },
}));
