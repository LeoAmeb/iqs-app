import { CalcResult, PersonalizadoParams, UserConfig } from "./types";
import { calcDesglose } from "./desglose";

export function calcPersonalizado(
  p: PersonalizadoParams,
  config?: UserConfig
): CalcResult {
  const horaObjetivo = config?.horaObjetivo ?? 230;
  const horaLaser = config?.horaLaser ?? 30;
  const horas = p.horas ?? 2;

  const trabajo = horas * (horaObjetivo + horaLaser);
  const materiales = p.materiales ?? 0;
  const extras = p.extras ?? 0;
  const margenExtra = p.margenExtra ?? 0;

  const base = trabajo + materiales + extras;
  const total = base * (1 + margenExtra / 100);
  const costo = horas * horaLaser + materiales;

  return calcDesglose(
    [
      { label: `Mano de obra · ${horas}h × $${horaObjetivo + horaLaser}/h`, val: Math.round(trabajo) },
      { label: "Materiales", val: materiales },
      { label: "Extras", val: extras },
      { label: `Margen extra ${margenExtra}%`, val: Math.round(base * margenExtra / 100) },
    ],
    total,
    costo
  );
}
