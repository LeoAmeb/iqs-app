"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRODUCTION_STAGES, getNextStage, getStage } from "@/lib/productionConfig";
import { formatSnapshot } from "@/lib/snapshotFormatter";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Phone, StickyNote } from "lucide-react";

export interface KanbanItem {
  id: string;
  categoria: string;
  catLabel: string;
  emoji: string;
  total: number;
  costo: number;
  iva: number;
  status: string;
  formSnapshot: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  pedido: {
    folio: number;
    clienteNombre: string;
    fechaEntrega: string | null;
    telefono: string | null;
    notas: string | null;
    status: string;
  };
  logs: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    nota: string | null;
    createdAt: string;
    user: { name: string };
  }>;
}

interface Props {
  item: KanbanItem | null;
  onClose: () => void;
  onStatusChange: (item: KanbanItem, newStatus: string) => Promise<void>;
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function ItemDetailDrawer({ item, onClose, onStatusChange }: Props) {
  const [saving, setSaving] = useState(false);
  const [nota, setNota] = useState("");
  const [showNota, setShowNota] = useState(false);

  if (!item) return null;

  const currentStage = getStage(item.status);
  const nextStage = getNextStage(item.status);

  async function handleAdvance() {
    if (!nextStage || !item) return;
    setSaving(true);
    try {
      await onStatusChange(item, nextStage.id);
      toast.success(`Avanzado a "${nextStage.label}"`);
      setNota("");
      setShowNota(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleSetStatus(statusId: string) {
    if (!item || statusId === item.status) return;
    setSaving(true);
    try {
      await onStatusChange(item, statusId);
      toast.success(`Estado actualizado a "${statusId}"`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{item.emoji}</span>
            <div className="min-w-0">
              <SheetTitle className="text-base leading-tight">{item.catLabel}</SheetTitle>
              <SheetDescription className="text-xs">
                Folio #{String(item.pedido.folio).padStart(4, "0")} · {item.pedido.clienteNombre}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Pedido details */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">{fmt(item.total)}</span>
            </div>
            {item.pedido.fechaEntrega && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Entrega: {formatDate(item.pedido.fechaEntrega)}</span>
              </div>
            )}
            {item.pedido.telefono && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{item.pedido.telefono}</span>
              </div>
            )}
            {item.pedido.notas && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{item.pedido.notas}</span>
              </div>
            )}
          </div>

          {/* Product details from formSnapshot */}
          {(() => {
            const details = formatSnapshot(item.categoria, item.formSnapshot);
            if (details.length === 0) return null;
            return (
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2.5">
                  Detalles del producto
                </p>
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
                  {details.map((d, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground">{d.label}</span>
                      <span className="text-xs font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Status stepper */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
              Estado actual
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {PRODUCTION_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  disabled={saving}
                  onClick={() => handleSetStatus(stage.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                    item.status === stage.id
                      ? "border-transparent shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                  style={
                    item.status === stage.id
                      ? { backgroundColor: `${stage.color}22`, color: stage.color, borderColor: `${stage.color}44` }
                      : undefined
                  }
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick advance */}
          {nextStage && (
            <>
              {showNota && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Nota (opcional)
                  </Label>
                  <Textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej: Listo para pintura"
                    className="min-h-[70px] resize-none text-sm"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  disabled={saving}
                  onClick={handleAdvance}
                  style={{ backgroundColor: nextStage.color }}
                >
                  <ArrowRight className="h-4 w-4" />
                  {nextStage.label}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowNota((v) => !v)}
                  title="Agregar nota"
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {item.status === PRODUCTION_STAGES[PRODUCTION_STAGES.length - 1].id && (
            <p className="text-xs text-center text-muted-foreground py-1">
              ✓ Proceso completado
            </p>
          )}

          <Separator />

          {/* History log */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
              Historial
            </p>
            {item.logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin movimientos aún.</p>
            ) : (
              <ol className="space-y-3">
                {[...item.logs].reverse().map((log) => {
                  const toStage = getStage(log.toStatus);
                  return (
                    <li key={log.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className="h-2 w-2 rounded-full mt-1 shrink-0"
                          style={{ backgroundColor: toStage.color }}
                        />
                        <div className="flex-1 w-px bg-border mt-1" />
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-tight">
                          {log.fromStatus
                            ? `${log.fromStatus} → ${log.toStatus}`
                            : `Creado como "${log.toStatus}"`}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {log.user.name} · {formatDateTime(log.createdAt)}
                        </p>
                        {log.nota && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 italic">
                            &ldquo;{log.nota}&rdquo;
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* Current status badge in footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Estado</span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${currentStage.color}22`, color: currentStage.color }}
          >
            {currentStage.label}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
