"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcPersonalizado } from "@/lib/pricing";
import { DesgloseCard } from "../DesgloseCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Sugerencias rápidas de horas
const HORAS_RAPIDAS = [0.5, 1, 1.5, 2, 3, 4, 6, 8];

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

export function PersonalizadoForm() {
  const { personalizado, updatePersonalizado } = useCotizadorStore();
  const s = personalizado;

  const result = useMemo(() => calcPersonalizado(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#f9fafb" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#374151" }}>
        Trabajo Libre
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">
        Cotización libre por horas de trabajo + materiales.
      </p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updatePersonalizado({ cliente: e.target.value })}
          placeholder="Ej: Proyecto especial"
          className="bg-white"
        />
      </div>

      {/* Horas */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Horas de trabajo
        </Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {HORAS_RAPIDAS.map((h) => (
            <ToggleBtn
              key={h}
              active={s.horas === h}
              onClick={() => updatePersonalizado({ horas: h })}
            >
              {h}h
            </ToggleBtn>
          ))}
        </div>
        <Input
          type="number"
          min={0}
          step={0.5}
          value={s.horas}
          onChange={(e) =>
            updatePersonalizado({ horas: Number(e.target.value) || 0 })
          }
          className="bg-white"
          placeholder="O ingresa las horas manualmente"
        />
        <p className="text-[10px] text-[#5c5c5c] mt-1">
          Tarifa: $260/h (objetivo $230 + láser $30)
        </p>
      </div>

      {/* Materiales */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Costo de materiales ($)
        </Label>
        <Input
          type="number"
          min={0}
          value={s.materiales}
          onChange={(e) =>
            updatePersonalizado({ materiales: Number(e.target.value) || 0 })
          }
          className="bg-white"
        />
      </div>

      {/* Extras */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Extras / costos adicionales ($)
        </Label>
        <Input
          type="number"
          min={0}
          value={s.extras}
          onChange={(e) =>
            updatePersonalizado({ extras: Number(e.target.value) || 0 })
          }
          className="bg-white"
        />
      </div>

      {/* Margen extra */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Margen adicional (%)
        </Label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {[0, 10, 15, 20, 25, 30].map((m) => (
            <ToggleBtn
              key={m}
              active={s.margenExtra === m}
              onClick={() => updatePersonalizado({ margenExtra: m })}
            >
              {m}%
            </ToggleBtn>
          ))}
        </div>
        <Input
          type="number"
          min={0}
          max={100}
          value={s.margenExtra}
          onChange={(e) =>
            updatePersonalizado({
              margenExtra: Math.min(100, Number(e.target.value) || 0),
            })
          }
          className="bg-white"
          placeholder="O ingresa el porcentaje"
        />
      </div>

      {/* Resumen rápido */}
      <div className="text-[10px] text-[#5c5c5c] bg-white border border-[#e2e2e2] rounded-lg px-3 py-2 mb-3 space-y-0.5">
        <div>Mano de obra: ${((s.horas || 0) * 260).toFixed(0)}</div>
        <div>Materiales: ${s.materiales || 0}</div>
        {(s.extras || 0) > 0 && <div>Extras: ${s.extras}</div>}
        {(s.margenExtra || 0) > 0 && <div>Margen {s.margenExtra}% aplicado al total base</div>}
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
            onChange={(e) =>
              updatePersonalizado({ fechaEntrega: e.target.value })
            }
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
            onChange={(e) =>
              updatePersonalizado({ horaEntrega: e.target.value })
            }
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
          onChange={(e) => updatePersonalizado({ notas: e.target.value })}
          placeholder="Descripción del trabajo, materiales, referencia..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
