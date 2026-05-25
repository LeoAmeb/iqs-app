"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcDisplays } from "@/lib/pricing";
import { DesgloseCard } from "../DesgloseCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

const TIPOS_DISPLAY: { value: number; label: string }[] = [
  { value: 600, label: "16cm estándar — $600" },
  { value: 700, label: "20cm estándar — $700" },
  { value: 800, label: "16cm premium — $800" },
  { value: 950, label: "20cm premium — $950" },
];

export function DisplaysForm() {
  const { displays, updateDisplays } = useCotizadorStore();
  const s = displays;

  const result = useMemo(() => calcDisplays(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#fdf2f8" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#9d174d" }}>
        Displays
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Displays acrílicos para exhibición.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateDisplays({ cliente: e.target.value })}
          placeholder="Ej: Tienda Flores"
          className="bg-white"
        />
      </div>

      {/* Tipo */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tipo de display
        </Label>
        <div className="flex flex-col gap-1.5">
          {TIPOS_DISPLAY.map((t) => (
            <ToggleBtn
              key={t.value}
              active={s.tipo === t.value}
              onClick={() => updateDisplays({ tipo: t.value })}
            >
              {t.label}
            </ToggleBtn>
          ))}
          <ToggleBtn
            active={s.tipo === "custom"}
            onClick={() => updateDisplays({ tipo: "custom" })}
          >
            Personalizado (precio libre)
          </ToggleBtn>
        </div>
      </div>

      {/* Custom */}
      {s.tipo === "custom" && (
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Precio venta ($)
            </Label>
            <Input
              type="number"
              min={0}
              value={s.precioLibre}
              onChange={(e) =>
                updateDisplays({ precioLibre: Number(e.target.value) || 0 })
              }
              className="bg-white"
            />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Costo ($)
            </Label>
            <Input
              type="number"
              min={0}
              value={s.costoLibre}
              onChange={(e) =>
                updateDisplays({ costoLibre: Number(e.target.value) || 0 })
              }
              className="bg-white"
            />
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cantidad
        </Label>
        <Input
          type="number"
          min={1}
          value={s.cantidad}
          onChange={(e) =>
            updateDisplays({ cantidad: Number(e.target.value) || 1 })
          }
          className="bg-white"
        />
      </div>

      {/* Extras */}
      {s.tipo !== "custom" && (
        <div className="mb-3">
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Extras
          </Label>
          <div className="flex flex-wrap gap-1.5">
            <ToggleBtn
              active={s.terceraCapa}
              onClick={() => updateDisplays({ terceraCapa: !s.terceraCapa })}
            >
              3ra capa +$150
            </ToggleBtn>
            <ToggleBtn
              active={s.urgente}
              onClick={() => updateDisplays({ urgente: !s.urgente })}
            >
              Urgente +30%
            </ToggleBtn>
          </div>
        </div>
      )}

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Fecha entrega
          </Label>
          <Input
            type="date"
            value={s.fechaEntrega}
            onChange={(e) => updateDisplays({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateDisplays({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateDisplays({ notas: e.target.value })}
          placeholder="Medidas, cantidad de niveles, detalles..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
