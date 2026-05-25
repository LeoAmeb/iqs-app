"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcLogos } from "@/lib/pricing";
import { DesgloseCard } from "../DesgloseCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const COLORES_BASE = ["Transparente","Negro","Blanco","Blanco lechoso","Rojo","Amarillo","Verde","Oro","Plata","Rose gold","Naranja","Celeste","Rosa","Fucsia"];
const COLORES_DISENO = ["Oro","Plata","Transparente","Negro","Blanco","Rose gold","Naranja","Celeste","Rosa","Fucsia"];
const COLORES_LED = ["Blanco frío","Blanco cálido","Azul","Rosa","Morado","Rojo","Verde"];

function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("px-3 py-1.5 rounded-lg border text-xs transition-all", active ? "bg-[#111] border-[#111] text-white font-medium" : "bg-white border-[#e2e2e2] text-[#5c5c5c] hover:bg-[#f4f4f4]")}>
      {children}
    </button>
  );
}

export function LogosForm() {
  const { logos, updateLogos } = useCotizadorStore();
  const s = logos;
  const result = useMemo(() => calcLogos(s as Parameters<typeof calcLogos>[0]), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#f5f3ff" }}>
      <h2 className="text-[17px] font-bold tracking-tight text-[#5b21b6] mb-0.5">Logo Acrílico</h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Con o sin base.</p>

      {/* Tipo */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Tipo</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.tipo === "base"} onClick={() => updateLogos({ tipo: "base" })}>Con base</ToggleBtn>
          <ToggleBtn active={s.tipo === "sinbase_a"} onClick={() => updateLogos({ tipo: "sinbase_a" })}>Sin base estándar</ToggleBtn>
          <ToggleBtn active={s.tipo === "sinbase_b"} onClick={() => updateLogos({ tipo: "sinbase_b" })}>Sin base premium</ToggleBtn>
        </div>
      </div>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Cliente</Label>
        <Input value={s.cliente} onChange={(e) => updateLogos({ cliente: e.target.value })} placeholder="Ej: Cafetería El Sol" className="bg-white" />
      </div>

      {/* CON BASE */}
      {s.tipo === "base" && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Tamaño</Label>
              <Select value={String(s.tamano)} onValueChange={(v) => updateLogos({ tamano: Number(v ?? "1590") })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1590">50cm — $1,590</SelectItem>
                  <SelectItem value="2090">60cm — $2,090</SelectItem>
                  <SelectItem value="3490">80cm — $3,490</SelectItem>
                  <SelectItem value="3990">90cm — $3,990</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Cantidad</Label>
              <Input type="number" min={1} value={s.cantidad} onChange={(e) => updateLogos({ cantidad: Number(e.target.value) || 1 })} className="bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Color base</Label>
              <Select value={s.colorBase} onValueChange={(v) => updateLogos({ colorBase: v ?? "Transparente" })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_BASE.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Color diseño</Label>
              <Select value={s.colorDiseno} onValueChange={(v) => updateLogos({ colorDiseno: v ?? "Oro" })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_DISENO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Chapetones */}
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Chapetones</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.chapeton === "plateado"} onClick={() => updateLogos({ chapeton: "plateado" })}>Plateados (incluidos)</ToggleBtn>
              <ToggleBtn active={s.chapeton === "dorado"} onClick={() => updateLogos({ chapeton: "dorado" })}>Dorados +$100</ToggleBtn>
            </div>
          </div>

          {/* Extras */}
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Extras</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.terceraCapa} onClick={() => updateLogos({ terceraCapa: !s.terceraCapa })}>3ra capa +$350</ToggleBtn>
              <ToggleBtn active={s.led} onClick={() => updateLogos({ led: !s.led })}>Iluminación LED</ToggleBtn>
              <ToggleBtn active={s.instalacion} onClick={() => updateLogos({ instalacion: !s.instalacion })}>Instalación +$300</ToggleBtn>
              <ToggleBtn active={s.urgente} onClick={() => updateLogos({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
              <ToggleBtn active={s.mismodia} onClick={() => updateLogos({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
            </div>
          </div>

          {s.terceraCapa && (
            <div className="mb-3">
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Color 3ra capa</Label>
              <Select value={s.colorTercera} onValueChange={(v) => updateLogos({ colorTercera: v ?? "Oro" })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_DISENO.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}

          {s.led && (
            <div className="mb-3">
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Color LED</Label>
              <Select value={s.colorLed} onValueChange={(v) => updateLogos({ colorLed: v ?? "Blanco frío" })}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>{COLORES_LED.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* SIN BASE */}
      {(s.tipo === "sinbase_a" || s.tipo === "sinbase_b") && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Ancho (cm)</Label>
              <Input type="number" value={s.ancho} onChange={(e) => updateLogos({ ancho: Number(e.target.value) || 100 })} className="bg-white" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Alto (cm)</Label>
              <Input type="number" value={s.alto} onChange={(e) => updateLogos({ alto: Number(e.target.value) || 40 })} className="bg-white" />
            </div>
          </div>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Cantidad</Label>
            <Input type="number" min={1} value={s.cantidad_sb} onChange={(e) => updateLogos({ cantidad_sb: Number(e.target.value) || 1 })} className="bg-white" />
          </div>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Extras</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.instalacion_sb} onClick={() => updateLogos({ instalacion_sb: !s.instalacion_sb })}>Instalación +$400</ToggleBtn>
              <ToggleBtn active={s.urgente_sb} onClick={() => updateLogos({ urgente_sb: !s.urgente_sb, mismodia_sb: false })}>Urgente +20%</ToggleBtn>
              <ToggleBtn active={s.mismodia_sb} onClick={() => updateLogos({ mismodia_sb: !s.mismodia_sb, urgente_sb: false })}>Mismo día +50%</ToggleBtn>
            </div>
          </div>
        </>
      )}

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Fecha entrega</Label>
          <Input type="date" value={s.fechaEntrega} onChange={(e) => updateLogos({ fechaEntrega: e.target.value })} className="bg-white" />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Hora</Label>
          <Input type="time" value={s.horaEntrega} onChange={(e) => updateLogos({ horaEntrega: e.target.value })} className="bg-white" />
        </div>
      </div>

      <div className="mb-2">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">Notas</Label>
        <Textarea value={s.notas} onChange={(e) => updateLogos({ notas: e.target.value })} placeholder="Colores, detalles..." className="bg-white min-h-[68px]" />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
