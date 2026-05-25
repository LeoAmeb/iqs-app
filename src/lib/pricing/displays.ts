import { CalcResult, DisplaysParams } from "./types";
import { calcDesglose } from "./desglose";

const COSTOS_DISPLAY: Record<number, number> = {
  600: 60,
  700: 78,
  800: 90,
  950: 110,
};

const LABELS_DISPLAY: Record<number, string> = {
  600: "16cm estándar",
  700: "20cm estándar",
  800: "16cm premium",
  950: "20cm premium",
};

export function calcDisplays(p: DisplaysParams): CalcResult {
  const cantidad = p.cantidad ?? 1;

  if (p.tipo === "custom") {
    const total = (p.precioLibre ?? 0) * cantidad;
    const costo = (p.costoLibre ?? 0) * cantidad;
    return calcDesglose(
      [{ label: "Display personalizado", val: total }],
      total,
      costo
    );
  }

  const tipo = p.tipo as number;
  const tercera = p.terceraCapa ? 150 : 0;
  const sub = tipo + tercera;
  const urg = p.urgente ? sub * 0.3 : 0;
  const total = (sub + urg) * cantidad;
  const costoUnit = COSTOS_DISPLAY[tipo] ?? 0;
  const costo = costoUnit * cantidad;

  return calcDesglose(
    [
      { label: `Display ${LABELS_DISPLAY[tipo] ?? ""}`, val: tipo * cantidad },
      { label: "3ra capa", val: tercera * cantidad },
      { label: "Urgente", val: Math.round(urg * cantidad) },
    ],
    total,
    costo
  );
}
