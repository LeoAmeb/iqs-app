import { CalcResult, TermosParams } from "./types";
import { calcDesglose } from "./desglose";

const PRECIOS_PROPIO: Record<string, number> = {
  solo_1:         100,
  solo_2:         150,
  mayoreo_corto:  60,
  mayoreo_nombre: 80,
};

export function calcTermos(p: TermosParams): CalcResult {
  const cantidad = p.cantidad ?? 1;

  if (p.termoPropio) {
    const precioUnit = PRECIOS_PROPIO[p.propioTipo ?? "solo_1"];
    const total = precioUnit * cantidad;
    const costo = 0;
    return calcDesglose(
      [{ label: `Grabado sobre termo propio (${p.propioTipo ?? "solo_1"})`, val: total }],
      total,
      costo
    );
  }

  // Nosotros incluimos el termo
  const precioBase = 300;
  const descuento =
    p.mayoreo === 10 ? 0.15 : p.mayoreo === 5 ? 0.1 : 0;
  const precioUnit = precioBase * (1 - descuento);
  const urg = p.urgente ? precioUnit * 0.2 : 0;
  const total = (precioUnit + urg) * cantidad;
  const costo = 130 * cantidad;

  return calcDesglose(
    [
      {
        label: `Termo ${p.tamano ?? 20}oz · ${p.color ?? ""}`,
        val: Math.round(precioBase * cantidad),
      },
      {
        label: `Descuento mayoreo ${p.mayoreo ?? 0}+piezas`,
        val: -Math.round(precioBase * descuento * cantidad),
      },
      { label: "Urgente", val: Math.round(urg * cantidad) },
    ],
    total,
    costo
  );
}
