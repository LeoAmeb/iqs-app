"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcDisplays } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleBtn } from "../ToggleBtn";
import { cn } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";

const TIPOS_DISPLAY: { value: number; label: string }[] = [
  { value: 600, label: "16cm estándar — $600" },
  { value: 700, label: "20cm estándar — $700" },
  { value: 800, label: "16cm premium — $800" },
  { value: 950, label: "20cm premium — $950" },
];

const cfg = CAT_CONFIG["displays"];

export function DisplaysForm() {
  const { displays, updateDisplays, setLastResult } = useCotizadorStore();
  const s = displays;
  const result = useMemo(() => calcDisplays(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de display</Label>
        <div className="flex flex-col gap-1.5">
          {TIPOS_DISPLAY.map((t) => (
            <ToggleBtn key={t.value} active={s.tipo === t.value} onClick={() => updateDisplays({ tipo: t.value })}>
              {t.label}
            </ToggleBtn>
          ))}
          <ToggleBtn active={s.tipo === "custom"} onClick={() => updateDisplays({ tipo: "custom" })}>
            Personalizado (precio libre)
          </ToggleBtn>
        </div>
      </div>

      {s.tipo === "custom" && (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Precio venta ($)</Label>
            <Input type="number" min={0} value={s.precioLibre} onChange={(e) => updateDisplays({ precioLibre: Number(e.target.value) || 0 })} className="bg-background" />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Costo ($)</Label>
            <Input type="number" min={0} value={s.costoLibre} onChange={(e) => updateDisplays({ costoLibre: Number(e.target.value) || 0 })} className="bg-background" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateDisplays({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>

      {s.tipo !== "custom" && (
        <div className="mb-4">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
          <div className="flex flex-wrap gap-1.5">
            <ToggleBtn active={s.terceraCapa} onClick={() => updateDisplays({ terceraCapa: !s.terceraCapa })}>3ra capa +$150</ToggleBtn>
            <ToggleBtn active={s.urgente} onClick={() => updateDisplays({ urgente: !s.urgente })}>Urgente +30%</ToggleBtn>
          </div>
        </div>
      )}
    </div>
  );
}
