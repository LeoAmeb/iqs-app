export * from "./types";
export * from "./constants";
export * from "./desglose";
export { calcLogos } from "./logos";
export { calcNeon } from "./neon";
export { calcToppers } from "./toppers";
export { calcMdf } from "./mdf";
export { calcTermos } from "./termos";
export { calcDisplays } from "./displays";
export { calcGrabado } from "./grabado";
export { calcCorte } from "./corte";
export { calcPersonalizado } from "./personalizado";

import { CalcResult, UserConfig } from "./types";
import { calcLogos } from "./logos";
import { calcNeon } from "./neon";
import { calcToppers } from "./toppers";
import { calcMdf } from "./mdf";
import { calcTermos } from "./termos";
import { calcDisplays } from "./displays";
import { calcGrabado } from "./grabado";
import { calcCorte } from "./corte";
import { calcPersonalizado } from "./personalizado";

import type {
  LogosParams,
  NeonParams,
  ToppersParams,
  MdfParams,
  TermosParams,
  DisplaysParams,
  GrabadoParams,
  CorteParams,
  PersonalizadoParams,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calcByCategory(cat: string, params: Record<string, any>, config?: UserConfig): CalcResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = params as any;
  switch (cat) {
    case "logos":         return calcLogos(p as LogosParams);
    case "neon":          return calcNeon(p as NeonParams);
    case "toppers":       return calcToppers(p as ToppersParams);
    case "mdf":           return calcMdf(p as MdfParams);
    case "termos":        return calcTermos(p as TermosParams);
    case "displays":      return calcDisplays(p as DisplaysParams);
    case "grabado":       return calcGrabado(p as GrabadoParams);
    case "corte":         return calcCorte(p as CorteParams);
    case "personalizado": return calcPersonalizado(p as PersonalizadoParams, config);
    default:
      throw new Error(`Categoría desconocida: ${cat}`);
  }
}
