"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcPersonalizado } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleBtn } from "../ToggleBtn";
import { cn } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";

const HORAS_RAPIDAS = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
const cfg = CAT_CONFIG["personalizado"];

export function PersonalizadoForm() {
  const { personalizado, updatePersonalizado, setLastResult } = useCotizadorStore();
  const s = personalizado;
  const result = useMemo(() => calcPersonalizado(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Horas de trabajo</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {HORAS_RAPIDAS.map((h) => (
            <ToggleBtn key={h} active={s.horas === h} onClick={() => updatePersonalizado({ horas: h })}>
              {h}h
            </ToggleBtn>
          ))}
        </div>
        <Input
          type="number"
          min={0}
          step={0.5}
          value={s.horas}
          onChange={(e) => updatePersonalizado({ horas: Number(e.target.value) || 0 })}
          className="bg-background"
          placeholder="O ingresa las horas manualmente"
        />
        <p className="text-[10px] text-muted-foreground mt-1">Tarifa: $260/h (objetivo $230 + láser $30)</p>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Costo de materiales ($)</Label>
        <Input type="number" min={0} value={s.materiales} onChange={(e) => updatePersonalizado({ materiales: Number(e.target.value) || 0 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras / costos adicionales ($)</Label>
        <Input type="number" min={0} value={s.extras} onChange={(e) => updatePersonalizado({ extras: Number(e.target.value) || 0 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Margen adicional (%)</Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[0, 10, 15, 20, 25, 30].map((m) => (
            <ToggleBtn key={m} active={s.margenExtra === m} onClick={() => updatePersonalizado({ margenExtra: m })}>
              {m}%
            </ToggleBtn>
          ))}
        </div>
        <Input
          type="number"
          min={0}
          max={100}
          value={s.margenExtra}
          onChange={(e) => updatePersonalizado({ margenExtra: Math.min(100, Number(e.target.value) || 0) })}
          className="bg-background"
          placeholder="O ingresa el porcentaje"
        />
      </div>

      <div className="text-[10px] text-muted-foreground bg-background border border-border rounded-lg px-3 py-2 mb-4 space-y-0.5">
        <div>Mano de obra: ${((s.horas || 0) * 260).toFixed(0)}</div>
        <div>Materiales: ${s.materiales || 0}</div>
        {(s.extras || 0) > 0 && <div>Extras: ${s.extras}</div>}
        {(s.margenExtra || 0) > 0 && <div>Margen {s.margenExtra}% aplicado al total base</div>}
      </div>
    </div>
  );
}
