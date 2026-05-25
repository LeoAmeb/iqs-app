import { CalcResult, NeonParams } from "./types";
import { NEON_METROS, NEON_METRAJE_EXTRA } from "./constants";
import { calcDesglose } from "./desglose";

export function calcNeon(p: NeonParams): CalcResult {
  const cantidad = p.cantidad ?? 1;
  const chapExtra = p.chapeton === "dorado" ? 100 : 0;
  const metrajeExtra = NEON_METRAJE_EXTRA[p.metraje] ?? 0;
  const apagador = p.apagador ? 120 : 0;
  const instalacion = p.instalacion ? 300 : 0;

  const sub = p.tipo + p.complejidad + metrajeExtra + chapExtra;
  const urg = p.mismodia ? sub * 0.5 : p.urgente ? sub * 0.2 : 0;
  const total = (sub + urg) * cantidad + apagador + instalacion;

  const metros = NEON_METROS[p.metraje] ?? 4;
  const costo = (metros * 32 + 223) * cantidad;

  return calcDesglose(
    [
      { label: `Letrero Neon · ${p.colorPrincipal ?? ""}`, val: p.tipo * cantidad },
      { label: "Complejidad extra", val: p.complejidad * cantidad },
      { label: `Metraje ${p.metraje}`, val: metrajeExtra * cantidad },
      { label: "Chapetones dorados", val: chapExtra * cantidad },
      { label: "Apagador", val: apagador },
      { label: "Instalación", val: instalacion },
      { label: "Urgente", val: Math.round(urg) * cantidad },
    ],
    total,
    costo
  );
}
