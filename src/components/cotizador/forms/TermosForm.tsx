"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcTermos } from "@/lib/pricing";
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

const COLORES_TERMOS = [
  "Negro","Blanco","Azul","Rosa","Celeste","Lila","Morado","Verde","Gris",
];

const cfg = CAT_CONFIG["termos"];

export function TermosForm() {
  const { termos, updateTermos, setLastResult } = useCotizadorStore();
  const s = termos;
  const result = useMemo(() => calcTermos(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">¿De quién es el termo?</Label>
        <div className="flex gap-1.5">
          <ToggleBtn active={!s.termoPropio} onClick={() => updateTermos({ termoPropio: false })}>Nuestro termo</ToggleBtn>
          <ToggleBtn active={s.termoPropio} onClick={() => updateTermos({ termoPropio: true })}>Termo del cliente</ToggleBtn>
        </div>
      </div>

      {s.termoPropio && (
        <div className="mb-4">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de grabado</Label>
          <div className="flex flex-wrap gap-1.5">
            <ToggleBtn active={s.propioTipo === "solo_1"} onClick={() => updateTermos({ propioTipo: "solo_1" })}>Solo 1 lado — $100</ToggleBtn>
            <ToggleBtn active={s.propioTipo === "solo_2"} onClick={() => updateTermos({ propioTipo: "solo_2" })}>Solo 2 lados — $150</ToggleBtn>
            <ToggleBtn active={s.propioTipo === "mayoreo_corto"} onClick={() => updateTermos({ propioTipo: "mayoreo_corto" })}>Mayoreo corto — $60</ToggleBtn>
            <ToggleBtn active={s.propioTipo === "mayoreo_nombre"} onClick={() => updateTermos({ propioTipo: "mayoreo_nombre" })}>Mayoreo nombre — $80</ToggleBtn>
          </div>
        </div>
      )}

      {!s.termoPropio && (
        <>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.tamano === 20} onClick={() => updateTermos({ tamano: 20 })}>20oz</ToggleBtn>
              <ToggleBtn active={s.tamano === 30} onClick={() => updateTermos({ tamano: 30 })}>30oz</ToggleBtn>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color del termo</Label>
            <Select value={s.color} onValueChange={(v) => updateTermos({ color: v ?? "Negro" })}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLORES_TERMOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Descuento mayoreo</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.mayoreo === 0} onClick={() => updateTermos({ mayoreo: 0 })}>Sin descuento</ToggleBtn>
              <ToggleBtn active={s.mayoreo === 5} onClick={() => updateTermos({ mayoreo: 5 })}>5+ piezas −10%</ToggleBtn>
              <ToggleBtn active={s.mayoreo === 10} onClick={() => updateTermos({ mayoreo: 10 })}>10+ piezas −15%</ToggleBtn>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.urgente} onClick={() => updateTermos({ urgente: !s.urgente })}>Urgente +20%</ToggleBtn>
            </div>
          </div>
        </>
      )}

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
        <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateTermos({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
      </div>
    </div>
  );
}
