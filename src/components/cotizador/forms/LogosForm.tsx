"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcLogos } from "@/lib/pricing";
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

const COLORES_BASE = ["Transparente","Negro","Blanco","Blanco lechoso","Rojo","Amarillo","Verde","Oro","Plata","Rose gold","Naranja","Celeste","Rosa","Fucsia"];
const COLORES_DISENO = ["Oro","Plata","Transparente","Negro","Blanco","Rose gold","Naranja","Celeste","Rosa","Fucsia"];
const COLORES_LED = ["Blanco frío","Blanco cálido","Azul","Rosa","Morado","Rojo","Verde"];

const cfg = CAT_CONFIG["logos"];

export function LogosForm() {
  const { logos, updateLogos, setLastResult } = useCotizadorStore();
  const s = logos;
  const result = useMemo(() => calcLogos(s as Parameters<typeof calcLogos>[0]), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      {/* Tipo */}
      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.tipo === "base"} onClick={() => updateLogos({ tipo: "base" })}>Con base</ToggleBtn>
          <ToggleBtn active={s.tipo === "sinbase_a"} onClick={() => updateLogos({ tipo: "sinbase_a" })}>Sin base estándar</ToggleBtn>
          <ToggleBtn active={s.tipo === "sinbase_b"} onClick={() => updateLogos({ tipo: "sinbase_b" })}>Sin base premium</ToggleBtn>
        </div>
      </div>

      {/* CON BASE */}
      {s.tipo === "base" && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño</Label>
              <Select value={String(s.tamano)} onValueChange={(v) => updateLogos({ tamano: Number(v ?? "1590") })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1590">50cm — $1,590</SelectItem>
                  <SelectItem value="2090">60cm — $2,090</SelectItem>
                  <SelectItem value="3490">80cm — $3,490</SelectItem>
                  <SelectItem value="3990">90cm — $3,990</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
              <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateLogos({ cantidad: Number(e.target.value) || 1 })} className="bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color base</Label>
              <Select value={s.colorBase} onValueChange={(v) => updateLogos({ colorBase: v ?? "Transparente" })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_BASE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color diseño</Label>
              <Select value={s.colorDiseno} onValueChange={(v) => updateLogos({ colorDiseno: v ?? "Oro" })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_DISENO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Chapetones</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.chapeton === "plateado"} onClick={() => updateLogos({ chapeton: "plateado" })}>Plateados (incluidos)</ToggleBtn>
              <ToggleBtn active={s.chapeton === "dorado"} onClick={() => updateLogos({ chapeton: "dorado" })}>Dorados +$100</ToggleBtn>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.terceraCapa} onClick={() => updateLogos({ terceraCapa: !s.terceraCapa })}>3ra capa +$350</ToggleBtn>
              <ToggleBtn active={s.led} onClick={() => updateLogos({ led: !s.led })}>Iluminación LED</ToggleBtn>
              <ToggleBtn active={s.instalacion} onClick={() => updateLogos({ instalacion: !s.instalacion })}>Instalación +$300</ToggleBtn>
              <ToggleBtn active={s.urgente} onClick={() => updateLogos({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
              <ToggleBtn active={s.mismodia} onClick={() => updateLogos({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
            </div>
          </div>

          {s.terceraCapa && (
            <div className="mb-4">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color 3ra capa</Label>
              <Select value={s.colorTercera} onValueChange={(v) => updateLogos({ colorTercera: v ?? "Oro" })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_DISENO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          {s.led && (
            <div className="mb-4">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Color LED</Label>
              <Select value={s.colorLed} onValueChange={(v) => updateLogos({ colorLed: v ?? "Blanco frío" })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_LED.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* SIN BASE */}
      {(s.tipo === "sinbase_a" || s.tipo === "sinbase_b") && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Ancho (cm)</Label>
              <Input type="number" value={s.ancho} onChange={(e) => updateLogos({ ancho: Number(e.target.value) || 100 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Alto (cm)</Label>
              <Input type="number" value={s.alto} onChange={(e) => updateLogos({ alto: Number(e.target.value) || 40 })} className="bg-background" />
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
            <Input type="number" min={1} value={s.cantidad_sb} onChange={(e) => updateLogos({ cantidad_sb: Number(e.target.value) || 1 })} className="bg-background" />
          </div>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.instalacion_sb} onClick={() => updateLogos({ instalacion_sb: !s.instalacion_sb })}>Instalación +$400</ToggleBtn>
              <ToggleBtn active={s.urgente_sb} onClick={() => updateLogos({ urgente_sb: !s.urgente_sb, mismodia_sb: false })}>Urgente +20%</ToggleBtn>
              <ToggleBtn active={s.mismodia_sb} onClick={() => updateLogos({ mismodia_sb: !s.mismodia_sb, urgente_sb: false })}>Mismo día +50%</ToggleBtn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
