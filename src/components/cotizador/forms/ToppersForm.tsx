"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcToppers } from "@/lib/pricing";
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

const COLORES_TOPPERS = [
  "Oro","Plata","Transparente","Negro","Blanco","Blanco lechoso",
  "Rosa","Rojo","Azul","Verde","Celeste","Fucsia","Naranja","Morado","Rose gold",
];

const cfg = CAT_CONFIG["toppers"];

export function ToppersForm() {
  const { toppers, updateToppers, setLastResult } = useCotizadorStore();
  const s = toppers;
  const result = useMemo(() => calcToppers(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Texto del topper</Label>
        <Input
          value={s.nombre}
          onChange={(e) => updateToppers({ nombre: e.target.value })}
          placeholder="Ej: Feliz cumpleaños Ana"
          className="bg-background"
        />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de cliente</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.tipoCliente === "nuevo"} onClick={() => updateToppers({ tipoCliente: "nuevo" })}>Nuevo</ToggleBtn>
          <ToggleBtn active={s.tipoCliente === "frecuente"} onClick={() => updateToppers({ tipoCliente: "frecuente" })}>Frecuente</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.tamano === 15} onClick={() => updateToppers({ tamano: 15 })}>Grande — 15cm</ToggleBtn>
          <ToggleBtn active={s.tamano === 12} onClick={() => updateToppers({ tamano: 12 })}>Chico — 10–12cm</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extra / complemento</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.extra === 0} onClick={() => updateToppers({ extra: 0 })}>Sin extra</ToggleBtn>
          <ToggleBtn active={s.extra === 50} onClick={() => updateToppers({ extra: 50 })}>Base +$50</ToggleBtn>
          <ToggleBtn active={s.extra === 60} onClick={() => updateToppers({ extra: 60 })}>Base premium +$60</ToggleBtn>
        </div>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color</Label>
        <Select value={s.color} onValueChange={(v) => updateToppers({ color: v ?? "Oro" })}>
          <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COLORES_TOPPERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateToppers({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={s.urgente} onClick={() => updateToppers({ urgente: !s.urgente })}>Urgente +20%</ToggleBtn>
        </div>
      </div>
    </div>
  );
}
