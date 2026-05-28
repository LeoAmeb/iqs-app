"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcGrabado } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleBtn } from "../ToggleBtn";
import { cn } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";

const GRABADO_PRECIOS: Record<string, Record<string, number[]>> = {
  nuevo:    { pequeno: [100, 120], mediano: [150, 200], grande: [250] },
  frecuente:{ pequeno: [60, 80],   mediano: [100, 150], grande: [180] },
};

const TAM_LABELS: Record<string, string> = {
  pequeno: "Pequeño",
  mediano: "Mediano",
  grande:  "Grande",
};

const cfg = CAT_CONFIG["grabado"];

export function GrabadoForm() {
  const { grabado, updateGrabado, setLastResult } = useCotizadorStore();
  const s = grabado;

  const preciosDisponibles = useMemo(
    () => GRABADO_PRECIOS[s.tipoCliente]?.[s.tam] ?? [],
    [s.tipoCliente, s.tam]
  );

  const precioActivo = preciosDisponibles.includes(s.precio)
    ? s.precio
    : preciosDisponibles[0] ?? 0;

  const result = useMemo(
    () => calcGrabado({ ...s, precio: precioActivo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, precioActivo]
  );

  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  useEffect(() => {
    if (precioActivo !== s.precio && preciosDisponibles.length > 0) {
      updateGrabado({ precio: precioActivo });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precioActivo]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Objeto a grabar</Label>
        <Input
          value={s.objeto}
          onChange={(e) => updateGrabado({ objeto: e.target.value })}
          placeholder="Ej: Taza, madera, llavero..."
          className="bg-background"
        />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de cliente</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.tipoCliente === "nuevo"} onClick={() => updateGrabado({ tipoCliente: "nuevo", precio: GRABADO_PRECIOS["nuevo"][s.tam][0] })}>Nuevo</ToggleBtn>
          <ToggleBtn active={s.tipoCliente === "frecuente"} onClick={() => updateGrabado({ tipoCliente: "frecuente", precio: GRABADO_PRECIOS["frecuente"][s.tam][0] })}>Frecuente</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño del grabado</Label>
        <div className="flex flex-wrap gap-1.5">
          {(["pequeno", "mediano", "grande"] as const).map((tam) => (
            <ToggleBtn key={tam} active={s.tam === tam} onClick={() => updateGrabado({ tam, precio: GRABADO_PRECIOS[s.tipoCliente][tam][0] })}>
              {TAM_LABELS[tam]}
            </ToggleBtn>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Precio unitario</Label>
        <div className="flex flex-wrap gap-1.5">
          {preciosDisponibles.map((p) => (
            <ToggleBtn key={p} active={precioActivo === p} onClick={() => updateGrabado({ precio: p })}>
              ${p}
            </ToggleBtn>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateGrabado({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.urgente} onClick={() => updateGrabado({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
          <ToggleBtn active={s.mismodia} onClick={() => updateGrabado({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
        </div>
      </div>
    </div>
  );
}
