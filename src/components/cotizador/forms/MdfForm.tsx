"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcMdf } from "@/lib/pricing";
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

const MEDIDAS_MDF = ["12x12", "16x16", "22x22", "25x25", "28x28", "30x30"];

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

export function MdfForm() {
  const { mdf, updateMdf, addBase, removeBase, updateBase } = useCotizadorStore();
  const s = mdf;

  const totalPiezasBases = useMemo(
    () => s.basesItems.reduce((acc, i) => acc + i.cant, 0),
    [s.basesItems]
  );

  const result = useMemo(() => calcMdf(s), [s]);
  const { setLastResult } = useCotizadorStore();
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className="rounded-xl p-3.5" style={{ background: "#f0fdf4" }}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: "#166534" }}>
        Corte MDF
      </h2>
      <p className="text-xs text-[#5c5c5c] mb-3">Letras, bases, llaveros y trabajos en MDF.</p>

      {/* Cliente */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Cliente
        </Label>
        <Input
          value={s.cliente}
          onChange={(e) => updateMdf({ cliente: e.target.value })}
          placeholder="Ej: Bodas Hernández"
          className="bg-white"
        />
      </div>

      {/* Subtipo */}
      <div className="mb-3">
        <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
          Tipo de trabajo
        </Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn
            active={s.subtipo === "nombres"}
            onClick={() => updateMdf({ subtipo: "nombres" })}
          >
            Letras / nombres
          </ToggleBtn>
          <ToggleBtn
            active={s.subtipo === "bases"}
            onClick={() => updateMdf({ subtipo: "bases" })}
          >
            Bases
          </ToggleBtn>
          <ToggleBtn
            active={s.subtipo === "llaveros"}
            onClick={() => updateMdf({ subtipo: "llaveros" })}
          >
            Llaveros
          </ToggleBtn>
          <ToggleBtn
            active={s.subtipo === "manual"}
            onClick={() => updateMdf({ subtipo: "manual" })}
          >
            Manual
          </ToggleBtn>
        </div>
      </div>

      {/* ── NOMBRES ── */}
      {s.subtipo === "nombres" && (
        <>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Tamaño
            </Label>
            <div className="flex gap-1.5">
              <ToggleBtn
                active={s.tamNombres === 150}
                onClick={() => updateMdf({ tamNombres: 150 })}
              >
                60cm — $150
              </ToggleBtn>
              <ToggleBtn
                active={s.tamNombres === 260}
                onClick={() => updateMdf({ tamNombres: 260 })}
              >
                80cm — $260
              </ToggleBtn>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
                Cantidad
              </Label>
              <Input
                type="number"
                min={1}
                value={s.cantNombres}
                onChange={(e) =>
                  updateMdf({ cantNombres: Number(e.target.value) || 1 })
                }
                className="bg-white"
              />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
                Vinil (metros)
              </Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={s.vinilMetros}
                onChange={(e) =>
                  updateMdf({ vinilMetros: Number(e.target.value) || 0 })
                }
                className="bg-white"
              />
            </div>
          </div>

          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Acabado
            </Label>
            <div className="flex gap-1.5">
              <ToggleBtn
                active={s.acabado === "natural"}
                onClick={() => updateMdf({ acabado: "natural" })}
              >
                Natural (incluido)
              </ToggleBtn>
              <ToggleBtn
                active={s.acabado === "pintado"}
                onClick={() => updateMdf({ acabado: "pintado" })}
              >
                Pintado +$100
              </ToggleBtn>
            </div>
          </div>

          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Extras
            </Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn
                active={s.urgente}
                onClick={() => updateMdf({ urgente: !s.urgente, mismodia: false })}
              >
                Urgente +20%
              </ToggleBtn>
              <ToggleBtn
                active={s.mismodia}
                onClick={() => updateMdf({ mismodia: !s.mismodia, urgente: false })}
              >
                Mismo día +50%
              </ToggleBtn>
            </div>
          </div>
        </>
      )}

      {/* ── BASES ── */}
      {s.subtipo === "bases" && (
        <>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Material
            </Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn
                active={s.materialBases === "3mm"}
                onClick={() => updateMdf({ materialBases: "3mm" })}
              >
                MDF 3mm
              </ToggleBtn>
              <ToggleBtn
                active={s.materialBases === "6mm"}
                onClick={() => updateMdf({ materialBases: "6mm" })}
              >
                MDF 6mm
              </ToggleBtn>
              <ToggleBtn
                active={s.materialBases === "6blanco"}
                onClick={() => updateMdf({ materialBases: "6blanco" })}
              >
                MDF 6mm blanco
              </ToggleBtn>
            </div>
          </div>

          {/* Info mayoreo */}
          <div
            className={cn(
              "text-xs px-3 py-2 rounded-lg mb-3 border",
              totalPiezasBases >= 20
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            )}
          >
            {totalPiezasBases >= 20
              ? `✓ Mayoreo activo — ${totalPiezasBases} piezas (precio mayoreo)`
              : `${totalPiezasBases} piezas — necesitas 20+ para precio mayoreo`}
          </div>

          {/* Lista de bases */}
          <div className="space-y-2 mb-3">
            {s.basesItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select
                    value={item.medida}
                    onValueChange={(v) => updateBase(idx, { medida: v ?? "12x12" })}
                  >
                    <SelectTrigger className="bg-white h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIDAS_MDF.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m} cm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min={1}
                    value={item.cant}
                    onChange={(e) =>
                      updateBase(idx, { cant: Number(e.target.value) || 1 })
                    }
                    className="bg-white h-8 text-xs text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBase(idx)}
                  className="text-[#999] hover:text-red-500 text-lg leading-none px-1 transition-colors"
                  disabled={s.basesItems.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addBase}
            className="w-full py-1.5 rounded-lg border border-dashed border-[#166534] text-[#166534] text-xs hover:bg-green-50 transition-colors mb-3"
          >
            + Agregar medida
          </button>
        </>
      )}

      {/* ── LLAVEROS ── */}
      {s.subtipo === "llaveros" && (
        <div className="mb-3">
          <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
            Cantidad
          </Label>
          <Input
            type="number"
            min={1}
            value={s.cantLlaveros}
            onChange={(e) =>
              updateMdf({ cantLlaveros: Number(e.target.value) || 1 })
            }
            className="bg-white"
          />
          <p className="text-[10px] text-[#5c5c5c] mt-1">Llavero 5×5cm con grabado — $15/pza</p>
        </div>
      )}

      {/* ── MANUAL ── */}
      {s.subtipo === "manual" && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
                Precio venta ($)
              </Label>
              <Input
                type="number"
                min={0}
                value={s.precioManual}
                onChange={(e) =>
                  updateMdf({ precioManual: Number(e.target.value) || 0 })
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
                value={s.costoManual}
                onChange={(e) =>
                  updateMdf({ costoManual: Number(e.target.value) || 0 })
                }
                className="bg-white"
              />
            </div>
          </div>
          <div className="mb-3">
            <Label className="text-[11px] uppercase tracking-wide text-[#5c5c5c] mb-1.5 block">
              Descripción del trabajo
            </Label>
            <Input
              value={s.notasManual}
              onChange={(e) => updateMdf({ notasManual: e.target.value })}
              placeholder="Ej: Marco personalizado 40×60cm"
              className="bg-white"
            />
          </div>
        </>
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
            onChange={(e) => updateMdf({ fechaEntrega: e.target.value })}
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
            onChange={(e) => updateMdf({ horaEntrega: e.target.value })}
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
          onChange={(e) => updateMdf({ notas: e.target.value })}
          placeholder="Colores, detalles, instrucciones..."
          className="bg-white min-h-[68px]"
        />
      </div>

      <DesgloseCard result={result} />
    </div>
  );
}
