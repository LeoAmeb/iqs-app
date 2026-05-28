"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcNeon } from "@/lib/pricing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleBtn } from "../ToggleBtn";
import { cn } from "@/lib/utils";
import { CAT_CONFIG } from "@/lib/categoryConfig";

const COLORES_NEON = [
  "Blanco frío","Blanco cálido","Azul","Rosa","Morado","Rojo","Verde","Amarillo","Naranja",
];

const cfg = CAT_CONFIG["neon"];

export function NeonForm() {
  const { neon, updateNeon, setLastResult } = useCotizadorStore();
  const s = neon;
  const result = useMemo(() => calcNeon(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño base</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.tipo === 1050} onClick={() => updateNeon({ tipo: 1050 })}>Pequeño — $1,050</ToggleBtn>
          <ToggleBtn active={s.tipo === 1700} onClick={() => updateNeon({ tipo: 1700 })}>Mediano — $1,700</ToggleBtn>
          <ToggleBtn active={s.tipo === 2800} onClick={() => updateNeon({ tipo: 2800 })}>Grande — $2,800</ToggleBtn>
          <ToggleBtn active={s.tipo === 3900} onClick={() => updateNeon({ tipo: 3900 })}>XL — $3,900</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Complejidad</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.complejidad === 0} onClick={() => updateNeon({ complejidad: 0 })}>Simple (incluida)</ToggleBtn>
          <ToggleBtn active={s.complejidad === 400} onClick={() => updateNeon({ complejidad: 400 })}>Media +$400</ToggleBtn>
          <ToggleBtn active={s.complejidad === 600} onClick={() => updateNeon({ complejidad: 600 })}>Alta +$600</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Metraje de tubo</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.metraje === "normal"} onClick={() => updateNeon({ metraje: "normal" })}>Normal — 4m (incluido)</ToggleBtn>
          <ToggleBtn active={s.metraje === "medio"} onClick={() => updateNeon({ metraje: "medio" })}>Medio — 7m +$250</ToggleBtn>
          <ToggleBtn active={s.metraje === "largo"} onClick={() => updateNeon({ metraje: "largo" })}>Largo — 10m +$350</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Chapetones</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.chapeton === "plateado"} onClick={() => updateNeon({ chapeton: "plateado" })}>Plateados (incluidos)</ToggleBtn>
          <ToggleBtn active={s.chapeton === "dorado"} onClick={() => updateNeon({ chapeton: "dorado" })}>Dorados +$100</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color principal</Label>
        <Select value={s.colorPrincipal} onValueChange={(v) => updateNeon({ colorPrincipal: v ?? "Blanco frío" })}>
          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COLORES_NEON.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateNeon({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.apagador} onClick={() => updateNeon({ apagador: !s.apagador })}>Apagador +$120</ToggleBtn>
          <ToggleBtn active={s.instalacion} onClick={() => updateNeon({ instalacion: !s.instalacion })}>Instalación +$300</ToggleBtn>
          <ToggleBtn active={s.urgente} onClick={() => updateNeon({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
          <ToggleBtn active={s.mismodia} onClick={() => updateNeon({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
        </div>
      </div>
    </div>
  );
}
