"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcGrabado } from "@/lib/pricing";
import { DesgloseCard } from "../DesgloseCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const GRABADO_PRECIOS: Record<string, Record<string, number[]>> = {
  nuevo:    { pequeno: [100, 120], mediano: [150, 200], grande: [250] },
  frecuente:{ pequeno: [60, 80],   mediano: [100, 150], grande: [180] },
};

const TAM_LABELS: Record<string, string> = {
  pequeno: "Pequeño",
  mediano: "Mediano",
  grande:  "Grande",
};

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

export function GrabadoForm() {
  const { grabado, updateGrabado, setLastResult } = useCotizadorStore();
  const s = grabado;

  // Precios disponibles según cliente y tamaño
  const preciosDisponibles = useMemo(
    () => GRABADO_PRECIOS[s.tipoCliente]?.[s.tam] ?? [],
    [s.tipoCliente, s.tam]
  );

  // Si el precio actual no está en la lista nueva, usar el primero disponible
  const precioActivo = preciosDisponibles.includes(s.precio)
    ? s.precio
    : preciosDisponibles[0] ?? 0;

  const result = useMemo(
    () => calcGrabado({ ...s, precio: precioActivo }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, precioActivo]
  );

  // Sincronizar result al store (useEffect evita el bucle de render)
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  // Sync precio si cambió de tabla (también en useEffect para evitar mutación durante render)
  useEffect(() => {
    if (precioActivo !== s.precio && preciosDisponibles.length > 0) {
      updateGrabado({ precio: precioActivo });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precioActivo]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#fffbeb" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#92400e" }}>
        Grabado Láser
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Grabado sobre objetos del cliente o propios.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateGrabado({ cliente: e.target.value })}
          placeholder="Ej: Recuerdos de boda"
          className="bg-white"
        />
      </div>

      {/* Objeto a grabar */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Objeto a grabar
        </Label>
        <Input
          value={s.objeto}
          onChange={(e) => updateGrabado({ objeto: e.target.value })}
          placeholder="Ej: Taza, madera, llavero..."
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
            onClick={() =>
              updateGrabado({
                tipoCliente: "nuevo",
                precio: GRABADO_PRECIOS["nuevo"][s.tam][0],
              })
            }
          >
            Nuevo
          </ToggleBtn>
          <ToggleBtn
            active={s.tipoCliente === "frecuente"}
            onClick={() =>
              updateGrabado({
                tipoCliente: "frecuente",
                precio: GRABADO_PRECIOS["frecuente"][s.tam][0],
              })
            }
          >
            Frecuente
          </ToggleBtn>
        </div>
      </div>

      {/* Tamaño */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tamaño del grabado
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {(["pequeno", "mediano", "grande"] as const).map((tam) => (
            <ToggleBtn
              key={tam}
              active={s.tam === tam}
              onClick={() =>
                updateGrabado({
                  tam,
                  precio: GRABADO_PRECIOS[s.tipoCliente][tam][0],
                })
              }
            >
              {TAM_LABELS[tam]}
            </ToggleBtn>
          ))}
        </div>
      </div>

      {/* Precio dinámico según tabla */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Precio unitario
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {preciosDisponibles.map((p) => (
            <ToggleBtn
              key={p}
              active={precioActivo === p}
              onClick={() => updateGrabado({ precio: p })}
            >
              ${p}
            </ToggleBtn>
          ))}
        </div>
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
            updateGrabado({ cantidad: Number(e.target.value) || 1 })
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
            onClick={() => updateGrabado({ urgente: !s.urgente, mismodia: false })}
          >
            Urgente +20%
          </ToggleBtn>
          <ToggleBtn
            active={s.mismodia}
            onClick={() => updateGrabado({ mismodia: !s.mismodia, urgente: false })}
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
            onChange={(e) => updateGrabado({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateGrabado({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateGrabado({ notas: e.target.value })}
          placeholder="Diseño, archivo, instrucciones..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
