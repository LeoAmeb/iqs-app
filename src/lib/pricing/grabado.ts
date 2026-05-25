import { CalcResult, GrabadoParams } from "./types";
import { calcDesglose } from "./desglose";

export function calcGrabado(p: GrabadoParams): CalcResult {
  const cantidad = p.cantidad ?? 1;
  const precio = p.precio ?? 0;
  const urg = p.mismodia ? precio * 0.5 : p.urgente ? precio * 0.2 : 0;
  const total = (precio + urg) * cantidad;
  const costo = precio * 0.15 * cantidad;

  return calcDesglose(
    [
      {
        label: `Grabado ${p.tam} · ${p.objeto ?? ""} · ${p.tipoCliente}`,
        val: precio * cantidad,
      },
      { label: "Urgente", val: Math.round(urg * cantidad) },
    ],
    total,
    costo
  );
}
