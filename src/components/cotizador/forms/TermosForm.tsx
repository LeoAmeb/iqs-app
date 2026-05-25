"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcTermos } from "@/lib/pricing";
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

const COLORES_TERMOS = [
  "Negro","Blanco","Azul","Rosa","Celeste","Lila","Morado","Verde","Gris",
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

export function TermosForm() {
  const { termos, updateTermos } = useCotizadorStore();
  const s = termos;

  const result = useMemo(() => calcTermos(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#f0f9ff" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#075985" }}>
        Termos Grabados
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Termos sublimados con diseño personalizado.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateTermos({ cliente: e.target.value })}
          placeholder="Ej: Regalo corporativo"
          className="bg-white"
        />
      </div>

      {/* ¿Termo propio o nuestro? */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          ¿De quién es el termo?
        </Label>
        <div className="flex gap-1.5">
          <ToggleBtn
            active={!s.termoPropio}
            onClick={() => updateTermos({ termoPropio: false })}
          >
            Nuestro termo
          </ToggleBtn>
          <ToggleBtn
            active={s.termoPropio}
            onClick={() => updateTermos({ termoPropio: true })}
          >
            Termo del cliente
          </ToggleBtn>
        </div>
      </div>

      {/* ── TERMO DEL CLIENTE ── */}
      {s.termoPropio && (
        <div className="mb-3">
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Tipo de grabado
          </Label>
          <div className="flex flex-wrap gap-1.5">
            <ToggleBtn
              active={s.propioTipo === "solo_1"}
              onClick={() => updateTermos({ propioTipo: "solo_1" })}
            >
              Solo 1 lado — $100
            </ToggleBtn>
            <ToggleBtn
              active={s.propioTipo === "solo_2"}
              onClick={() => updateTermos({ propioTipo: "solo_2" })}
            >
              Solo 2 lados — $150
            </ToggleBtn>
            <ToggleBtn
              active={s.propioTipo === "mayoreo_corto"}
              onClick={() => updateTermos({ propioTipo: "mayoreo_corto" })}
            >
              Mayoreo corto — $60
            </ToggleBtn>
            <ToggleBtn
              active={s.propioTipo === "mayoreo_nombre"}
              onClick={() => updateTermos({ propioTipo: "mayoreo_nombre" })}
            >
              Mayoreo nombre — $80
            </ToggleBtn>
          </div>
        </div>
      )}

      {/* ── NUESTRO TERMO ── */}
      {!s.termoPropio && (
        <>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Tamaño
            </Label>
            <div className="flex gap-1.5">
              <ToggleBtn
                active={s.tamano === 20}
                onClick={() => updateTermos({ tamano: 20 })}
              >
                20oz
              </ToggleBtn>
              <ToggleBtn
                active={s.tamano === 30}
                onClick={() => updateTermos({ tamano: 30 })}
              >
                30oz
              </ToggleBtn>
            </div>
          </div>

          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Color del termo
            </Label>
            <Select
              value={s.color}
              onValueChange={(v) => updateTermos({ color: v ?? "Negro" })}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLORES_TERMOS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Descuento mayoreo
            </Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn
                active={s.mayoreo === 0}
                onClick={() => updateTermos({ mayoreo: 0 })}
              >
                Sin descuento
              </ToggleBtn>
              <ToggleBtn
                active={s.mayoreo === 5}
                onClick={() => updateTermos({ mayoreo: 5 })}
              >
                5+ piezas −10%
              </ToggleBtn>
              <ToggleBtn
                active={s.mayoreo === 10}
                onClick={() => updateTermos({ mayoreo: 10 })}
              >
                10+ piezas −15%
              </ToggleBtn>
            </div>
          </div>
        </>
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
          onChange={(e) => updateTermos({ cantidad: Number(e.target.value) || 1 })}
          className="bg-white"
        />
      </div>

      {/* Urgente */}
      {!s.termoPropio && (
        <div className="mb-3">
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Extras
          </Label>
          <div className="flex gap-1.5">
            <ToggleBtn
              active={s.urgente}
              onClick={() => updateTermos({ urgente: !s.urgente })}
            >
              Urgente +20%
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
            onChange={(e) => updateTermos({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateTermos({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateTermos({ notas: e.target.value })}
          placeholder="Diseño, colores, instrucciones..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
