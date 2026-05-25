import { CalcResult, DesgloseRow } from "./types";

/**
 * Calcula los valores derivados del total y costo.
 * IVA absorbido: total / 1.16 * 0.16
 * Margen: (ganancia / total) * 100
 */
export function calcDesglose(
  rows: DesgloseRow[],
  total: number,
  costo: number
): CalcResult {
  const roundedTotal = Math.round(total);
  const roundedCosto = Math.round(costo);
  const iva = Math.round((roundedTotal / 1.16) * 0.16);
  const neto = roundedTotal - iva;
  const ganancia = roundedTotal - roundedCosto - iva;
  const margen = roundedTotal > 0 ? (ganancia / roundedTotal) * 100 : 0;

  return {
    rows: rows.filter((r) => r.val !== 0),
    total: roundedTotal,
    costo: roundedCosto,
    iva,
    neto,
    ganancia,
    margen,
  };
}
