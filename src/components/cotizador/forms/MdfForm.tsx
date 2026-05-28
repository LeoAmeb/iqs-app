"use client";
import { useMemo, useEffect } from "react";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { calcMdf } from "@/lib/pricing";
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

const MEDIDAS_MDF = ["12x12", "16x16", "22x22", "25x25", "28x28", "30x30"];
const cfg = CAT_CONFIG["mdf"];

export function MdfForm() {
  const { mdf, updateMdf, addBase, removeBase, updateBase, setLastResult } = useCotizadorStore();
  const s = mdf;

  const totalPiezasBases = useMemo(
    () => s.basesItems.reduce((acc, i) => acc + i.cant, 0),
    [s.basesItems]
  );

  const result = useMemo(() => calcMdf(s), [s]);
  useEffect(() => { setLastResult(result); }, [result, setLastResult]);

  return (
    <div className={cn("rounded-xl p-4", cfg.formBgClass)}>
      <h2 className="text-[17px] font-bold tracking-tight mb-0.5" style={{ color: cfg.color }}>
        {cfg.label}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">{cfg.description}</p>

      <div className="mb-4">
        <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tipo de trabajo</Label>
        <div className="flex flex-wrap gap-1.5">
          <ToggleBtn active={s.subtipo === "nombres"} onClick={() => updateMdf({ subtipo: "nombres" })}>Letras / nombres</ToggleBtn>
          <ToggleBtn active={s.subtipo === "bases"} onClick={() => updateMdf({ subtipo: "bases" })}>Bases</ToggleBtn>
          <ToggleBtn active={s.subtipo === "llaveros"} onClick={() => updateMdf({ subtipo: "llaveros" })}>Llaveros</ToggleBtn>
          <ToggleBtn active={s.subtipo === "manual"} onClick={() => updateMdf({ subtipo: "manual" })}>Manual</ToggleBtn>
        </div>
      </div>

      {/* ── NOMBRES ── */}
      {s.subtipo === "nombres" && (
        <>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Tamaño</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.tamNombres === 150} onClick={() => updateMdf({ tamNombres: 150 })}>60cm — $150</ToggleBtn>
              <ToggleBtn active={s.tamNombres === 260} onClick={() => updateMdf({ tamNombres: 260 })}>80cm — $260</ToggleBtn>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
              <Input type="number" min={1} value={s.cantNombres} onChange={(e) => updateMdf({ cantNombres: Number(e.target.value) || 1 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Vinil (metros)</Label>
              <Input type="number" min={0} step={0.1} value={s.vinilMetros} onChange={(e) => updateMdf({ vinilMetros: Number(e.target.value) || 0 })} className="bg-background" />
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Acabado</Label>
            <div className="flex gap-1.5">
              <ToggleBtn active={s.acabado === "natural"} onClick={() => updateMdf({ acabado: "natural" })}>Natural (incluido)</ToggleBtn>
              <ToggleBtn active={s.acabado === "pintado"} onClick={() => updateMdf({ acabado: "pintado" })}>Pintado +$100</ToggleBtn>
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Extras</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.urgente} onClick={() => updateMdf({ urgente: !s.urgente, mismodia: false })}>Urgente +20%</ToggleBtn>
              <ToggleBtn active={s.mismodia} onClick={() => updateMdf({ mismodia: !s.mismodia, urgente: false })}>Mismo día +50%</ToggleBtn>
            </div>
          </div>
        </>
      )}

      {/* ── BASES ── */}
      {s.subtipo === "bases" && (
        <>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Material</Label>
            <div className="flex flex-wrap gap-1.5">
              <ToggleBtn active={s.materialBases === "3mm"} onClick={() => updateMdf({ materialBases: "3mm" })}>MDF 3mm</ToggleBtn>
              <ToggleBtn active={s.materialBases === "6mm"} onClick={() => updateMdf({ materialBases: "6mm" })}>MDF 6mm</ToggleBtn>
              <ToggleBtn active={s.materialBases === "6blanco"} onClick={() => updateMdf({ materialBases: "6blanco" })}>MDF 6mm blanco</ToggleBtn>
            </div>
          </div>

          <div className={cn(
            "text-xs px-3 py-2 rounded-lg mb-4 border",
            totalPiezasBases >= 20
              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
          )}>
            {totalPiezasBases >= 20
              ? `✓ Mayoreo activo — ${totalPiezasBases} piezas`
              : `${totalPiezasBases} piezas — necesitas 20+ para precio mayoreo`}
          </div>

          <div className="space-y-2 mb-4">
            {s.basesItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select value={item.medida} onValueChange={(v) => updateBase(idx, { medida: v ?? "12x12" })}>
                    <SelectTrigger className="bg-background h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEDIDAS_MDF.map((m) => <SelectItem key={m} value={m}>{m} cm</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input type="number" min={1} value={item.cant} onChange={(e) => updateBase(idx, { cant: Number(e.target.value) || 1 })} className="bg-background h-8 text-xs text-center" />
                </div>
                <button
                  type="button"
                  onClick={() => removeBase(idx)}
                  className="text-muted-foreground hover:text-destructive text-lg leading-none px-1 transition-colors"
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
            className="w-full py-1.5 rounded-lg border border-dashed border-muted-foreground/40 text-muted-foreground text-xs hover:bg-muted transition-colors mb-4"
          >
            + Agregar medida
          </button>
        </>
      )}

      {/* ── LLAVEROS ── */}
      {s.subtipo === "llaveros" && (
        <div className="mb-4">
          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Cantidad</Label>
          <Input type="number" min={1} value={s.cantLlaveros} onChange={(e) => updateMdf({ cantLlaveros: Number(e.target.value) || 1 })} className="bg-background" />
          <p className="text-[10px] text-muted-foreground mt-1">Llavero 5×5cm con grabado — $15/pza</p>
        </div>
      )}

      {/* ── MANUAL ── */}
      {s.subtipo === "manual" && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Precio venta ($)</Label>
              <Input type="number" min={0} value={s.precioManual} onChange={(e) => updateMdf({ precioManual: Number(e.target.value) || 0 })} className="bg-background" />
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Costo ($)</Label>
              <Input type="number" min={0} value={s.costoManual} onChange={(e) => updateMdf({ costoManual: Number(e.target.value) || 0 })} className="bg-background" />
            </div>
          </div>
          <div className="mb-4">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 block">Descripción</Label>
            <Input value={s.notasManual} onChange={(e) => updateMdf({ notasManual: e.target.value })} placeholder="Ej: Marco personalizado 40×60cm" className="bg-background" />
          </div>
        </>
      )}
    </div>
  );
}
