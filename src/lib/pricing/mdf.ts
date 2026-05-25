import { CalcResult, MdfParams } from "./types";
import { BASES_V, BASES_MINI, BASES_CM2, MDF_CM2C, MdfMaterial, BaseMedida } from "./constants";
import { calcDesglose } from "./desglose";

export function calcMdf(p: MdfParams): CalcResult {
  switch (p.subtipo) {
    case "nombres": {
      const tamPrecio = p.tamNombres ?? 150;
      const cantidad = p.cantNombres ?? 1;
      const pintado = p.acabado === "pintado" ? 100 : 0;
      const vinilMetros = p.vinilMetros ?? 0;
      const vinil = vinilMetros * 120;

      const sub = tamPrecio + pintado + vinil;
      const urg = p.mismodia ? sub * 0.5 : p.urgente ? sub * 0.2 : 0;
      const total = (sub + urg) * cantidad;

      const tamCm = tamPrecio === 150 ? 60 : 80;
      const costoBase = tamCm * tamCm * 0.006;
      const costoPintado = pintado > 0 ? 33 : 0;
      const costoVinil = vinilMetros * 60;
      const costo = (costoBase + costoPintado + costoVinil) * cantidad;

      return calcDesglose(
        [
          { label: `Letras/Nombre ${tamCm}cm`, val: tamPrecio * cantidad },
          { label: "Acabado pintado", val: pintado * cantidad },
          { label: `Vinil ${vinilMetros}m`, val: vinil * cantidad },
          { label: "Urgente", val: Math.round(urg) * cantidad },
        ],
        total,
        costo
      );
    }

    case "bases": {
      const material = (p.materialBases ?? "3mm") as MdfMaterial;
      const items = p.basesItems ?? [];
      const totalPiezas = items.reduce((acc, i) => acc + i.cant, 0);
      const esMayoreo = totalPiezas >= 20;
      const tabla = esMayoreo ? BASES_V : BASES_MINI;

      let totalPrecio = 0;
      let totalCosto = 0;
      const rows = items.map((item) => {
        const medida = item.medida as BaseMedida;
        const precioUnit = tabla[material]?.[medida] ?? 0;
        const costoUnit = (BASES_CM2[medida] ?? 0) * MDF_CM2C[material];
        totalPrecio += precioUnit * item.cant;
        totalCosto += costoUnit * item.cant;
        return {
          label: `Base ${medida} × ${item.cant}u`,
          val: precioUnit * item.cant,
        };
      });

      return calcDesglose(rows, totalPrecio, totalCosto);
    }

    case "llaveros": {
      const cantidad = p.cantLlaveros ?? 20;
      const precioUnit = 15;
      const total = precioUnit * cantidad;
      const costoUnit = 25 * 0.006 + 1; // 5x5cm MDF + grabado
      const costo = costoUnit * cantidad;
      return calcDesglose(
        [{ label: `Llavero 5×5cm grabado × ${cantidad}u`, val: total }],
        total,
        costo
      );
    }

    case "manual": {
      const total = p.precioManual ?? 0;
      const costo = p.costoManual ?? 0;
      return calcDesglose(
        [{ label: p.notasManual ?? "Trabajo manual", val: total }],
        total,
        costo
      );
    }

    default:
      return calcDesglose([], 0, 0);
  }
}
