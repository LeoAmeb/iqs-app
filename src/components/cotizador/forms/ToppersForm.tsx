"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcToppers } from "@/lib/pricing";
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

const COLORES_TOPPERS = [
  "Oro","Plata","Transparente","Negro","Blanco","Blanco lechoso",
  "Rosa","Rojo","Azul","Verde","Celeste","Fucsia","Naranja","Morado","Rose gold",
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

export function ToppersForm() {
  const { toppers, updateToppers } = useCotizadorStore();
  const s = toppers;

  const result = useMemo(() => calcToppers(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#fff7ed" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#c2410c" }}>
        Toppers
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Toppers de acrílico para pasteles y eventos.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateToppers({ cliente: e.target.value })}
          placeholder="Ej: Fiesta XV años"
          className="bg-white"
        />
      </div>

      {/* Nombre del topper */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Texto / nombre del topper
        </Label>
        <Input
          value={s.nombre}
          onChange={(e) => updateToppers({ nombre: e.target.value })}
          placeholder="Ej: Feliz cumpleaños Ana"
          className="bg-white"
        />
      </div>

      {/* Tipo de cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tipo de cliente
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.tipoCliente === "nuevo"}
            onClick={() => updateToppers({ tipoCliente: "nuevo" })}
          >
            Nuevo
          </ToggleBtn>
          <ToggleBtn
            active={s.tipoCliente === "frecuente"}
            onClick={() => updateToppers({ tipoCliente: "frecuente" })}
          >
            Frecuente
          </ToggleBtn>
        </div>
      </div>

      {/* Tamaño */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tamaño
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.tamano === 15}
            onClick={() => updateToppers({ tamano: 15 })}
          >
            Grande — 15cm
          </ToggleBtn>
          <ToggleBtn
            active={s.tamano === 12}
            onClick={() => updateToppers({ tamano: 12 })}
          >
            Chico — 10–12cm
          </ToggleBtn>
        </div>
      </div>

      {/* Extra */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Extra / complemento
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.extra === 0}
            onClick={() => updateToppers({ extra: 0 })}
          >
            Sin extra
          </ToggleBtn>
          <ToggleBtn
            active={s.extra === 50}
            onClick={() => updateToppers({ extra: 50 })}
          >
            Base +$50
          </ToggleBtn>
          <ToggleBtn
            active={s.extra === 60}
            onClick={() => updateToppers({ extra: 60 })}
          >
            Base premium +$60
          </ToggleBtn>
        </div>
      </div>

      {/* Color */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Color
        </Label>
        <Select
          value={s.color}
          onValueChange={(v) => updateToppers({ color: v ?? "Oro" })}
        >
          <SelectTrigger className="bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLORES_TOPPERS.map((c) => (
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
          onChange={(e) => updateToppers({ cantidad: Number(e.target.value) || 1 })}
          className="bg-white"
        />
      </div>

      {/* Urgente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Extras
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.urgente}
            onClick={() => updateToppers({ urgente: !s.urgente })}
          >
            Urgente +20%
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
            onChange={(e) => updateToppers({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateToppers({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateToppers({ notas: e.target.value })}
          placeholder="Colores, texto, detalles..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
