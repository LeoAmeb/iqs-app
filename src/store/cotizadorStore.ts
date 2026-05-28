"use client";
import { create } from "zustand";
import { CalcResult, BaseItem } from "@/lib/pricing/types";
import { Category, CAT_CONFIG } from "@/lib/categoryConfig";

// ─── Shared client data ───────────────────────────────────────────────────────

export interface ClienteData {
  nombre: string;
  telefono: string;
  fechaEntrega: string;
  horaEntrega: string;
  notas: string;
  clienteId: string | null;
}

const defaultClienteData: ClienteData = {
  nombre: "",
  telefono: "",
  fechaEntrega: "",
  horaEntrega: "",
  notas: "",
  clienteId: null,
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  categoria: Category;
  catLabel: string;
  emoji: string;
  result: CalcResult;
  formSnapshot: Record<string, unknown>;
}

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
}

interface ToppersState {
  tamano: 15 | 12;
  tipoCliente: "nuevo" | "frecuente";
  extra: 0 | 50 | 60;
  urgente: boolean;
  cantidad: number;
  color: string;
  nombre: string;
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
}

interface TermosState {
  termoPropio: boolean;
  propioTipo: "solo_1" | "solo_2" | "mayoreo_corto" | "mayoreo_nombre";
  tamano: 20 | 30;
  color: string;
  mayoreo: 0 | 5 | 10;
  cantidad: number;
  urgente: boolean;
}

interface DisplaysState {
  tipo: number | "custom";
  precioLibre: number;
  costoLibre: number;
  cantidad: number;
  terceraCapa: boolean;
  urgente: boolean;
}

interface GrabadoState {
  tipoCliente: "nuevo" | "frecuente";
  tam: "pequeno" | "mediano" | "grande";
  precio: number;
  cantidad: number;
  objeto: string;
  urgente: boolean;
  mismodia: boolean;
}

interface CorteState {
  material: "acrilico" | "mdf";
  ancho: number;
  alto: number;
  cantidad: number;
  urgente: boolean;
  mismodia: boolean;
}

interface PersonalizadoState {
  horas: number;
  materiales: number;
  extras: number;
  margenExtra: number;
}

// ─── Store completo ───────────────────────────────────────────────────────────

interface CotizadorStore {
  view: "grid" | "form";
  currentCat: Category;
  lastResult: CalcResult | null;
  clienteData: ClienteData;
  cart: CartItem[];

  logos: LogosState;
  neon: NeonState;
  toppers: ToppersState;
  mdf: MdfState;
  termos: TermosState;
  displays: DisplaysState;
  grabado: GrabadoState;
  corte: CorteState;
  personalizado: PersonalizadoState;

  setView: (view: "grid" | "form") => void;
  setCategory: (cat: Category) => void;
  setLastResult: (result: CalcResult | null) => void;
  updateClienteData: (partial: Partial<ClienteData>) => void;
  resetClienteData: () => void;

  addToCart: () => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

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
};

const defaultNeon: NeonState = {
  tipo: 1700, complejidad: 0, metraje: "normal", chapeton: "plateado",
  apagador: false, instalacion: false, urgente: false, mismodia: false,
  cantidad: 1, colorPrincipal: "Blanco frío",
};

const defaultToppers: ToppersState = {
  tamano: 15, tipoCliente: "nuevo", extra: 0, urgente: false,
  cantidad: 1, color: "Oro", nombre: "",
};

const defaultMdf: MdfState = {
  subtipo: "nombres", tamNombres: 150, cantNombres: 1,
  acabado: "natural", vinilMetros: 0,
  materialBases: "3mm", basesItems: [{ medida: "12x12", cant: 1 }],
  cantLlaveros: 20, precioManual: 0, costoManual: 0, notasManual: "",
  urgente: false, mismodia: false,
};

const defaultTermos: TermosState = {
  termoPropio: false, propioTipo: "solo_1", tamano: 20,
  color: "Negro", mayoreo: 0, cantidad: 1, urgente: false,
};

const defaultDisplays: DisplaysState = {
  tipo: 600, precioLibre: 0, costoLibre: 0,
  cantidad: 1, terceraCapa: false, urgente: false,
};

const defaultGrabado: GrabadoState = {
  tipoCliente: "nuevo", tam: "pequeno", precio: 100,
  cantidad: 1, objeto: "", urgente: false, mismodia: false,
};

const defaultCorte: CorteState = {
  material: "acrilico", ancho: 30, alto: 30, cantidad: 1,
  urgente: false, mismodia: false,
};

const defaultPersonalizado: PersonalizadoState = {
  horas: 2, materiales: 0, extras: 0, margenExtra: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCotizadorStore = create<CotizadorStore>((set, get) => ({
  view: "grid",
  currentCat: "logos",
  lastResult: null,
  clienteData: defaultClienteData,
  cart: [],
  logos: defaultLogos,
  neon: defaultNeon,
  toppers: defaultToppers,
  mdf: defaultMdf,
  termos: defaultTermos,
  displays: defaultDisplays,
  grabado: defaultGrabado,
  corte: defaultCorte,
  personalizado: defaultPersonalizado,

  setView: (view) => set({ view }),
  setCategory: (cat) => set({ currentCat: cat, view: "form", lastResult: null }),
  setLastResult: (result) => set({ lastResult: result }),
  updateClienteData: (partial) =>
    set((s) => ({ clienteData: { ...s.clienteData, ...partial } })),
  resetClienteData: () => set({ clienteData: defaultClienteData }),

  addToCart: () => {
    const { currentCat, lastResult } = get();
    if (!lastResult || lastResult.total === 0) return;
    const cfg = CAT_CONFIG[currentCat];
    const formSnapshot = get()[currentCat] as unknown as Record<string, unknown>;
    const item: CartItem = {
      id: `${currentCat}-${Date.now()}`,
      categoria: currentCat,
      catLabel: cfg.label,
      emoji: cfg.emoji,
      result: lastResult,
      formSnapshot: { ...formSnapshot },
    };
    set((s) => ({ cart: [...s.cart, item], lastResult: null }));
    // Reset the current form after adding to cart
    const defaults: Record<Category, unknown> = {
      logos: defaultLogos, neon: defaultNeon, toppers: defaultToppers,
      mdf: defaultMdf, termos: defaultTermos, displays: defaultDisplays,
      grabado: defaultGrabado, corte: defaultCorte, personalizado: defaultPersonalizado,
    };
    set({ [currentCat]: defaults[currentCat] });
  },

  removeFromCart: (id) =>
    set((s) => ({ cart: s.cart.filter((item) => item.id !== id) })),

  clearCart: () => set({ cart: [] }),

  updateLogos: (partial) => set((s) => ({ logos: { ...s.logos, ...partial } })),
  updateNeon: (partial) => set((s) => ({ neon: { ...s.neon, ...partial } })),
  updateToppers: (partial) => set((s) => ({ toppers: { ...s.toppers, ...partial } })),
  updateMdf: (partial) => set((s) => ({ mdf: { ...s.mdf, ...partial } })),
  updateTermos: (partial) => set((s) => ({ termos: { ...s.termos, ...partial } })),
  updateDisplays: (partial) => set((s) => ({ displays: { ...s.displays, ...partial } })),
  updateGrabado: (partial) => set((s) => ({ grabado: { ...s.grabado, ...partial } })),
  updateCorte: (partial) => set((s) => ({ corte: { ...s.corte, ...partial } })),
  updatePersonalizado: (partial) =>
    set((s) => ({ personalizado: { ...s.personalizado, ...partial } })),

  addBase: () =>
    set((s) => ({
      mdf: { ...s.mdf, basesItems: [...s.mdf.basesItems, { medida: "12x12", cant: 1 }] },
    })),
  removeBase: (index) =>
    set((s) => ({
      mdf: { ...s.mdf, basesItems: s.mdf.basesItems.filter((_, i) => i !== index) },
    })),
  updateBase: (index, partial) =>
    set((s) => ({
      mdf: {
        ...s.mdf,
        basesItems: s.mdf.basesItems.map((b, i) => (i === index ? { ...b, ...partial } : b)),
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
