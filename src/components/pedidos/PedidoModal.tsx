"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, CheckCircle2Icon, XCircleIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { PedidoStatus, FormaPago } from "@/generated/prisma/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmt, folioStr, fmtFecha } from "@/lib/utils";
import { getStage } from "@/lib/productionConfig";
import { formatSnapshot } from "@/lib/snapshotFormatter";
import type { Pedido } from "./PedidoCard";

interface PedidoModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

const FORMA_PAGO_OPTIONS: { value: FormaPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
];

const STATUS_MANUAL_OPTIONS: { value: PedidoStatus; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "LISTO", label: "Listo" },
  { value: "URGENTE", label: "Urgente" },
];

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

function toTimeInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function PedidoModal({ pedido, onClose }: PedidoModalProps) {
  const qc = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const [telefono, setTelefono] = useState(pedido?.telefono ?? "");
  const [anticipo, setAnticipo] = useState(String(pedido?.anticipo ?? 0));
  const [formaPago, setFormaPago] = useState<FormaPago | "">(
    pedido?.formaPago ?? ""
  );
  const [fechaEntrega, setFechaEntrega] = useState(
    toDateInput(pedido?.fechaEntrega)
  );
  const [horaEntrega, setHoraEntrega] = useState(
    toTimeInput(pedido?.fechaEntrega)
  );
  const [status, setStatus] = useState<PedidoStatus>(
    pedido?.status === "ENTREGADO" || pedido?.status === "CANCELADO" || pedido?.status === "PROXIMO"
      ? "PENDIENTE"
      : (pedido?.status ?? "PENDIENTE")
  );
  const [notas, setNotas] = useState(pedido?.notas ?? "");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["pedidos"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!pedido) return;
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: telefono || null,
          anticipo: Number(anticipo),
          formaPago: formaPago || null,
          fechaEntrega: fechaEntrega || null,
          horaEntrega: horaEntrega || "12:00",
          status,
          notas: notas || null,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pedido actualizado");
      invalidate();
      onClose();
    },
    onError: () => toast.error("No se pudo guardar el pedido"),
  });

  const entregadoMutation = useMutation({
    mutationFn: async () => {
      if (!pedido) return;
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENTREGADO" }),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pedido marcado como entregado");
      invalidate();
      onClose();
    },
    onError: () => toast.error("No se pudo actualizar"),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!pedido) return;
      const res = await fetch(`/api/pedidos/${pedido.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Pedido cancelado");
      invalidate();
      onClose();
    },
    onError: () => toast.error("No se pudo cancelar el pedido"),
  });

  if (!pedido) return null;

  const margen = pedido.total > 0
    ? Math.round(((pedido.total - pedido.costo - pedido.iva) / pedido.total) * 100)
    : 0;
  const isEntregado = pedido.status === "ENTREGADO";
  const isBusy =
    saveMutation.isPending ||
    entregadoMutation.isPending ||
    cancelMutation.isPending;

  async function handleDownloadPDF() {
    if (!pedido) return;
    try {
      const res = await fetch("/api/pdf/recibo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: pedido.id }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${String(pedido.folio).padStart(4, "0")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo generar el PDF");
    }
  }

  return (
    <>
      <Sheet open={!!pedido} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-4 pb-0">
          <SheetHeader className="px-0 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base">
                {folioStr(pedido.folio)} &middot; {pedido.catLabel}
              </SheetTitle>
              <StatusBadge status={pedido.status} />
            </div>
          </SheetHeader>

          {/* Financial summary */}
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{pedido.clienteNombre}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold">{fmt(pedido.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Costo</p>
              <p>{fmt(pedido.costo)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IVA absorbido</p>
              <p>{fmt(pedido.iva)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Margen neto</p>
              <p
                className={
                  margen >= 50
                    ? "font-semibold text-green-700"
                    : margen >= 25
                    ? "font-semibold text-yellow-700"
                    : "font-semibold text-red-600"
                }
              >
                {margen}%
              </p>
            </div>
          </div>

          {/* Products breakdown */}
          {pedido.items && pedido.items.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Productos
              </p>
              <div className="space-y-1.5">
                {pedido.items.map((item) => {
                  const stage = getStage(item.status);
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors"
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0">{item.emoji}</span>
                          <span className="text-sm text-foreground truncate">{item.catLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-sm font-semibold">{fmt(item.total)}</span>
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              backgroundColor: `${stage.color}20`,
                              color: stage.color,
                            }}
                          >
                            {stage.label}
                          </span>
                          {expandedItem === item.id
                            ? <ChevronUpIcon className="size-3.5 text-muted-foreground shrink-0" />
                            : <ChevronDownIcon className="size-3.5 text-muted-foreground shrink-0" />
                          }
                        </div>
                      </button>
                      {expandedItem === item.id && item.formSnapshot && (
                        <div className="border-t border-border bg-muted/20 px-3 py-2.5">
                          {(() => {
                            const details = formatSnapshot(item.categoria, item.formSnapshot);
                            if (details.length === 0) return (
                              <p className="text-xs text-muted-foreground">Sin detalles disponibles.</p>
                            );
                            return (
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {details.map((d, i) => (
                                  <div key={i} className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                                    <span className="text-xs font-medium text-foreground">{d.value}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="mb-4" />

          {/* Editable form */}
          <div className="space-y-4 pb-4">
            {/* Telefono */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-tel">Teléfono / WhatsApp</Label>
              <Input
                id="modal-tel"
                type="tel"
                placeholder="55 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {/* Anticipo + Forma pago */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-anticipo">Anticipo ($)</Label>
                <Input
                  id="modal-anticipo"
                  type="number"
                  min="0"
                  step="1"
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Forma de pago</Label>
                <Select
                  value={formaPago}
                  onValueChange={(v) => setFormaPago(v as FormaPago)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMA_PAGO_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fecha + Hora entrega */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="modal-fecha">Fecha entrega</Label>
                <Input
                  id="modal-fecha"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modal-hora">Hora</Label>
                <Input
                  id="modal-hora"
                  type="time"
                  value={horaEntrega}
                  onChange={(e) => setHoraEntrega(e.target.value)}
                />
              </div>
            </div>

            {/* Status manual */}
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as PedidoStatus)}
                disabled={isEntregado}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_MANUAL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label htmlFor="modal-notas">Notas</Label>
              <Textarea
                id="modal-notas"
                placeholder="Observaciones, detalles del pedido..."
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>

          {/* Footer with action buttons */}
          <SheetFooter className="px-0 pt-2 pb-6 gap-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleDownloadPDF}
              disabled={isBusy}
            >
              <DownloadIcon className="size-4" />
              Descargar recibo PDF
            </Button>

            <Button
              className="w-full"
              onClick={() => saveMutation.mutate()}
              disabled={isBusy}
            >
              {saveMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Guardar cambios
            </Button>

            {!isEntregado && (
              <Button
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => entregadoMutation.mutate()}
                disabled={isBusy}
              >
                {entregadoMutation.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2Icon className="size-4" />
                )}
                Marcar como entregado
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isBusy || isEntregado}
            >
              <XCircleIcon className="size-4" />
              Cancelar pedido
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el pedido {folioStr(pedido.folio)} de{" "}
              <strong>{pedido.clienteNombre}</strong> como cancelado. Los
              administradores pueden eliminarlo permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setShowCancelConfirm(false);
                cancelMutation.mutate();
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
