"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcCorte } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleBtn } from "../ToggleBtn";
import { cn } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";

const cfg = CAT_CONFIG["corte"];

export function CorteForm() {
  const { corte, updateCorte, setLastResult } = useCotizadorStore();
  const s = corte;
  const result = useMemo(() => calcCorte(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  const area = s.ancho * s.alto;

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Material</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.material === "acrilico"} onClick={() => updateCorte({ material: "acrilico" })}>Acrílico</ToggleBtn>
          <ToggleBtn active={s.material === "mdf"} onClick={() => updateCorte({ material: "mdf" })}>MDF</ToggleBtn>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Ancho (cm)</Label>
          <Input type="number" min={1} value={s.ancho} onChange={(e) => updateCorte({ ancho: Number(e.target.value) || 1 })} className="bg-background" />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Alto (cm)</Label>
          <Input type="number" min={1} value={s.alto} onChange={(e) => updateCorte({ alto: Number(e.target.value) || 1 })} className="bg-background" />
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground bg-background border border-border rounded-lg px-3 py-2 mb-4">
        Área: {area.toLocaleString()} cm²
        {" · "}
        {s.material === "acrilico" ? "Acrílico (×3 margen)" : "MDF (×5 margen)"}
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateCorte({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.urgente} onClick={() => updateCorte({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
          <ToggleBtn active={s.mismodia} onClick={() => updateCorte({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
        </div>
      </div>
    </div>
  );
}
