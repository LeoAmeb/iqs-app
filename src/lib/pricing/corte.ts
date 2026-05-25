import { CalcResult, CorteParams } from "./types";
import { calcDesglose } from "./desglose";

export function calcCorte(p: CorteParams): CalcResult {
  const cantidad = p.cantidad ?? 1;
  const area = (p.ancho ?? 30) * (p.alto ?? 30);
  const isAcrilico = p.material === "acrilico";
  const factorCosto = isAcrilico ? 0.04 : 0.006;
  const multiplicador = isAcrilico ? 3 : 5;
  const costoMat = area * factorCosto;
  const precioUnit = costoMat * multiplicador;

  const urg = p.mismodia
    ? precioUnit * 0.5
    : p.urgente
    ? precioUnit * 0.2
    : 0;

  const total = (precioUnit + urg) * cantidad;
  const costo = costoMat * cantidad;

  return calcDesglose(
    [
      {
        label: `Corte ${p.material} ${p.ancho ?? 30}×${p.alto ?? 30}cm`,
        val: Math.round(precioUnit * cantidad),
      },
      { label: "Urgente", val: Math.round(urg * cantidad) },
    ],
    total,
    costo
  );
}
