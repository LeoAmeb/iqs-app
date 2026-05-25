"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcCorte } from "@/lib/pricing";
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

export function CorteForm() {
  const { corte, updateCorte } = useCotizadorStore();
  const s = corte;

  const result = useMemo(() => calcCorte(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  const area = s.ancho * s.alto;

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#f0fdfa" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#134e4a" }}>
        Corte Simple
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Corte láser en acrílico o MDF.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateCorte({ cliente: e.target.value })}
          placeholder="Ej: Señalética Oficinas"
          className="bg-white"
        />
      </div>

      {/* Material */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Material
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={s.material === "acrilico"}
            onClick={() => updateCorte({ material: "acrilico" })}
          >
            Acrílico
          </ToggleBtn>
          <ToggleBtn
            active={s.material === "mdf"}
            onClick={() => updateCorte({ material: "mdf" })}
          >
            MDF
          </ToggleBtn>
        </div>
      </div>

      {/* Dimensiones */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Ancho (cm)
          </Label>
          <Input
            type="number"
            min={1}
            value={s.ancho}
            onChange={(e) =>
              updateCorte({ ancho: Number(e.target.value) || 1 })
            }
            className="bg-white"
          />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Alto (cm)
          </Label>
          <Input
            type="number"
            min={1}
            value={s.alto}
            onChange={(e) =>
              updateCorte({ alto: Number(e.target.value) || 1 })
            }
            className="bg-white"
          />
        </div>
      </div>

      {/* Info área */}
      <div className="text-[10px] text-[#5c5c5c] bg-white border border-[#e2e2e2] rounded-lg px-3 py-2 mb-3">
        Área: {area.toLocaleString()} cm²
        {" · "}
        Material: {s.material === "acrilico" ? "Acrílico (×3 margen)" : "MDF (×5 margen)"}
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
          onChange={(e) =>
            updateCorte({ cantidad: Number(e.target.value) || 1 })
          }
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
            active={s.urgente}
            onClick={() => updateCorte({ urgente: !s.urgente, mismodia: false })}
          >
            Urgente +20%
          </ToggleBtn>
          <ToggleBtn
            active={s.mismodia}
            onClick={() => updateCorte({ mismodia: !s.mismodia, urgente: false })}
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
            onChange={(e) => updateCorte({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateCorte({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateCorte({ notas: e.target.value })}
          placeholder="Espesor, color, archivo, detalles..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
