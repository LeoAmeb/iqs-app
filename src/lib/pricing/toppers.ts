import { CalcResult, ToppersParams } from "./types";
import { calcDesglose } from "./desglose";

const PRECIOS_TOPPER: Record<"nuevo" | "frecuente", Record<15 | 12, number>> = {
  nuevo:    { 15: 150, 12: 120 },
  frecuente:{ 15: 100, 12: 85 },
};

const COSTOS_TOPPER: Record<15 | 12, number> = { 15: 18, 12: 12 };

export function calcToppers(p: ToppersParams): CalcResult {
  const precioUnit = PRECIOS_TOPPER[p.tipoCliente][p.tamano];
  const costoUnit = COSTOS_TOPPER[p.tamano];
  const cantidad = p.cantidad ?? 1;

  const sub = precioUnit + (p.extra ?? 0);
  const urg = p.urgente ? sub * 0.2 : 0;
  const total = (sub + urg) * cantidad;
  const costo = costoUnit * cantidad;

  return calcDesglose(
    [
      {
        label: `Topper ${p.tamano}cm · ${p.color ?? ""} · "${p.nombre ?? ""}"`,
        val: precioUnit * cantidad,
      },
      { label: "Pieza adicional pequeña", val: (p.extra ?? 0) * cantidad },
      { label: "Urgente", val: Math.round(urg) * cantidad },
    ],
    total,
    costo
  );
}
