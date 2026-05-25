import { CalcResult, LogosParams } from "./types";
import { LOGO_TAMANOS } from "./constants";
import { calcDesglose } from "./desglose";

export function calcLogos(p: LogosParams): CalcResult {
  if (p.tipo === "base") {
    const tamPrecio = p.tamano ?? 1590;
    const tamCm = LOGO_TAMANOS[tamPrecio] ?? 50;
    const cantidad = p.cantidad ?? 1;
    const chapExtra = p.chapeton === "dorado" ? 100 : 0;
    const tercera = p.terceraCapa ? 350 : 0;

    const sub = tamPrecio + tercera + chapExtra;
    const urg = p.mismodia ? sub * 0.5 : p.urgente ? sub * 0.2 : 0;
    const ins = p.instalacion ? 300 : 0;
    const total = (sub + urg) * cantidad + ins;

    const costoLed = p.led ? 105 * cantidad : 0;
    const costo = tamCm * tamCm * 0.04 * 2 * cantidad + costoLed;

    return calcDesglose(
      [
        {
          label: `Logo ${tamCm}cm · Base: ${p.colorBase ?? "—"} · Diseño: ${p.colorDiseno ?? "—"}`,
          val: tamPrecio * cantidad,
        },
        { label: `3ra capa · ${p.colorTercera ?? ""}`, val: tercera * cantidad },
        { label: "Chapetones dorados", val: chapExtra * cantidad },
        { label: `Iluminación LED ${p.colorLed ?? ""}`, val: 0 },
        { label: "Urgente", val: Math.round(urg) * cantidad },
        { label: "Instalación", val: ins },
      ],
      total,
      costo
    );
  }

  // Sin base (estándar o premium)
  const ancho = p.ancho ?? 100;
  const alto = p.alto ?? 40;
  const cantidad = p.cantidad_sb ?? 1;
  const area = ancho * alto;

  const cE = area * 0.06; // espejo
  const cS = p.tipo === "sinbase_a" ? area * 0.006 : area * 0.04; // MDF o transparente
  const pb = (cE + cS) * 5;

  const urg = p.mismodia_sb ? pb * 0.5 : p.urgente_sb ? pb * 0.2 : 0;
  const ins = p.instalacion_sb ? 400 : 0;
  const total = (pb + urg) * cantidad + ins;

  const descMaterial = p.tipo === "sinbase_a" ? "Espejo + MDF" : "Espejo + transparente";
  const costo = (cE + cS + 26) * cantidad;

  return calcDesglose(
    [
      {
        label: `Logo sin base ${ancho}×${alto}cm · ${descMaterial}`,
        val: Math.round(pb * cantidad),
      },
      { label: "Urgente", val: Math.round(urg * cantidad) },
      { label: "Instalación", val: ins },
    ],
    total,
    costo
  );
}
