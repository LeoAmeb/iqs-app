"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ReceiptIcon } from "lucide-react";
import { PedidoStatus, FormaPago } from "@/generated/prisma";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmt, folioStr, fmtFecha } from "@/lib/utils";

export interface Pedido {
  id: string;
  folio: number;
  catLabel: string;
  clienteNombre: string;
  total: number;
  costo: number;
  iva: number;
  status: PedidoStatus;
  anticipo: number;
  formaPago?: FormaPago | null;
  telefono?: string | null;
  fechaEntrega?: Date | string | null;
  notas?: string | null;
  createdAt: Date | string;
}

const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

interface PedidoCardProps {
  pedido: Pedido;
  onClick: (pedido: Pedido) => void;
}

export function PedidoCard({ pedido, onClick }: PedidoCardProps) {
  const [showRecibo, setShowRecibo] = useState(false);

  const subtotalSinIva = pedido.total - pedido.iva;
  const saldo = pedido.total - pedido.anticipo;

  return (
    <Card className="w-full cursor-pointer transition-shadow hover:shadow-md">
      {/* Clickable area to open modal */}
      <CardHeader
        onClick={() => onClick(pedido)}
        className="pb-2"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{pedido.clienteNombre}</CardTitle>
            <CardDescription className="mt-0.5">{pedido.catLabel}</CardDescription>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">
            {fmt(pedido.total)}
          </span>
        </div>
      </CardHeader>

      <CardFooter className="flex items-center justify-between gap-2 py-2.5">
        <div className="flex items-center gap-2">
          <StatusBadge status={pedido.status} />
          {pedido.fechaEntrega && (
            <span className="text-xs text-muted-foreground">
              {fmtFecha(pedido.fechaEntrega)}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setShowRecibo((v) => !v);
          }}
        >
          <ReceiptIcon className="size-3.5" />
          {showRecibo ? "Ocultar" : "Ver recibo"}
          {showRecibo ? (
            <ChevronUpIcon className="size-3.5" />
          ) : (
            <ChevronDownIcon className="size-3.5" />
          )}
        </Button>
      </CardFooter>

      {/* Inline receipt */}
      {showRecibo && (
        <CardContent className="border-t pt-4 pb-4">
          {/* Receipt header */}
          <div className="mb-3 text-center">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Ideas QSolucionan
            </p>
            <p className="text-xs text-muted-foreground">
              Folio {folioStr(pedido.folio)} &middot;{" "}
              {fmtFecha(pedido.createdAt)}
            </p>
          </div>

          <Separator className="mb-3" />

          {/* Client + category */}
          <div className="mb-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="font-medium">{pedido.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto</span>
              <span>{pedido.catLabel}</span>
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Amounts */}
          <div className="mb-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal sin IVA</span>
              <span>{fmt(subtotalSinIva)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA</span>
              <span>{fmt(pedido.iva)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{fmt(pedido.total)}</span>
            </div>
          </div>

          <Separator className="mb-3" />

          {/* Payment */}
          <div className="mb-2 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anticipo recibido</span>
              <span className="text-green-700">{fmt(pedido.anticipo)}</span>
            </div>
            {pedido.formaPago && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de pago</span>
                <span>{FORMA_PAGO_LABELS[pedido.formaPago]}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Saldo pendiente</span>
              <span className={saldo > 0 ? "text-red-600" : "text-green-700"}>
                {fmt(saldo)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {pedido.notas && (
            <>
              <Separator className="mb-3" />
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Notas
                </p>
                <p className="text-sm whitespace-pre-wrap">{pedido.notas}</p>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
