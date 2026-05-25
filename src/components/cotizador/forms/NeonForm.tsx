"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcNeon } from "@/lib/pricing";
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

const COLORES_NEON = [
  "Blanco frío","Blanco cálido","Azul","Rosa","Morado","Rojo","Verde","Amarillo","Naranja",
];

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg border text-xs transition-all",
        active
          ? "bg-[#111] border-[#111] text-white font-medium"
          : "bg-white border-[#e2e2e2] text-[#5c5c5c] hover:bg-[#f4f4f4]"
      )}
    >
      {children}
    </button>
  );
}

export function NeonForm() {
  const { neon, updateNeon } = useCotizadorStore();
  const s = neon;

  const result = useMemo(() => calcNeon(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#fdf2f8" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#be185d" }}>
        Letrero Neon
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Letreros de neón LED personalizados.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateNeon({ cliente: e.target.value })}
          placeholder="Ej: Bodas González"
          className="bg-white"
        />
      </div>

      {/* Tamaño / tipo */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tamaño base
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.tipo === 1050}
            onClick={() => updateNeon({ tipo: 1050 })}
          >
            Pequeño — $1,050
          </ToggleBtn>
          <ToggleBtn
            active={s.tipo === 1700}
            onClick={() => updateNeon({ tipo: 1700 })}
          >
            Mediano — $1,700
          </ToggleBtn>
          <ToggleBtn
            active={s.tipo === 2800}
            onClick={() => updateNeon({ tipo: 2800 })}
          >
            Grande — $2,800
          </ToggleBtn>
          <ToggleBtn
            active={s.tipo === 3900}
            onClick={() => updateNeon({ tipo: 3900 })}
          >
            XL — $3,900
          </ToggleBtn>
        </div>
      </div>

      {/* Complejidad */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Complejidad
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.complejidad === 0}
            onClick={() => updateNeon({ complejidad: 0 })}
          >
            Simple (incluida)
          </ToggleBtn>
          <ToggleBtn
            active={s.complejidad === 400}
            onClick={() => updateNeon({ complejidad: 400 })}
          >
            Media +$400
          </ToggleBtn>
          <ToggleBtn
            active={s.complejidad === 600}
            onClick={() => updateNeon({ complejidad: 600 })}
          >
            Alta +$600
          </ToggleBtn>
        </div>
      </div>

      {/* Metraje */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Metraje de tubo
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.metraje === "normal"}
            onClick={() => updateNeon({ metraje: "normal" })}
          >
            Normal — 4m (incluido)
          </ToggleBtn>
          <ToggleBtn
            active={s.metraje === "medio"}
            onClick={() => updateNeon({ metraje: "medio" })}
          >
            Medio — 7m +$250
          </ToggleBtn>
          <ToggleBtn
            active={s.metraje === "largo"}
            onClick={() => updateNeon({ metraje: "largo" })}
          >
            Largo — 10m +$350
          </ToggleBtn>
        </div>
      </div>

      {/* Chapetones */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Chapetones
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.chapeton === "plateado"}
            onClick={() => updateNeon({ chapeton: "plateado" })}
          >
            Plateados (incluidos)
          </ToggleBtn>
          <ToggleBtn
            active={s.chapeton === "dorado"}
            onClick={() => updateNeon({ chapeton: "dorado" })}
          >
            Dorados +$100
          </ToggleBtn>
        </div>
      </div>

      {/* Color */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Color principal
        </Label>
        <Select
          value={s.colorPrincipal}
          onValueChange={(v) => updateNeon({ colorPrincipal: v ?? "Blanco frío" })}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLORES_NEON.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cantidad */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cantidad
        </Label>
        <Input
          type="number"
          min={1}
          value={s.cantidad}
          onChange={(e) => updateNeon({ cantidad: Number(e.target.value) || 1 })}
          className="bg-white"
        />
      </div>

      {/* Extras */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Extras
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.apagador}
            onClick={() => updateNeon({ apagador: !s.apagador })}
          >
            Apagador +$120
          </ToggleBtn>
          <ToggleBtn
            active={s.instalacion}
            onClick={() => updateNeon({ instalacion: !s.instalacion })}
          >
            Instalación +$300
          </ToggleBtn>
          <ToggleBtn
            active={s.urgente}
            onClick={() => updateNeon({ urgente: !s.urgente, mismodia: false })}
          >
            Urgente +20%
          </ToggleBtn>
          <ToggleBtn
            active={s.mismodia}
            onClick={() => updateNeon({ mismodia: !s.mismodia, urgente: false })}
          >
            Mismo día +50%
          </ToggleBtn>
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Fecha entrega
          </Label>
          <Input
            type="date"
            value={s.fechaEntrega}
            onChange={(e) => updateNeon({ fechaEntrega: e.target.value })}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Hora
          </Label>
          <Input
            type="time"
            value={s.horaEntrega}
            onChange={(e) => updateNeon({ horaEntrega: e.target.value })}
            className="bg-white"
          />
        </div>
      </div>

      <div className="mb-2">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Notas
        </Label>
        <Textarea
          value={s.notas}
          onChange={(e) => updateNeon({ notas: e.target.value })}
          placeholder="Texto, medidas, detalles..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
