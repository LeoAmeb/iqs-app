"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fmt, folioStr } from "@/lib/utils";
import type { CalcResult } from "@/lib/pricing";
import { MessageCircleIcon, CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

interface VistaClienteModalProps {
  open: boolean;
  onClose: () => void;
  catLabel: string;
  clienteNombre: string;
  result: CalcResult;
  /** detalles para enriquecer el mensaje */
  detalles?: {
    fechaEntrega?: string;
    horaEntrega?: string;
    notas?: string;
    telefono?: string;
  };
}

function buildWhatsAppText(
  catLabel: string,
  clienteNombre: string,
  result: CalcResult,
  detalles?: VistaClienteModalProps["detalles"]
): string {
  const lines: string[] = [];
  lines.push(`*Cotización – ${catLabel}*`);
  if (clienteNombre) lines.push(`Cliente: ${clienteNombre}`);
  lines.push("");

  result.rows.forEach((row) => {
    lines.push(`• ${row.label}: ${fmt(row.val)}`);
  });

  lines.push("");
  lines.push(`*Total: ${fmt(result.total)}*`);
  lines.push(`_(IVA incluido: ${fmt(result.iva)})_`);

  if (detalles?.fechaEntrega) {
    const [y, m, d] = detalles.fechaEntrega.split("-");
    const fecha = `${d}/${m}/${y}`;
    const hora = detalles.horaEntrega ? ` · ${detalles.horaEntrega}` : "";
    lines.push(`\nFecha de entrega: ${fecha}${hora}`);
  }

  if (detalles?.notas) {
    lines.push(`\nNotas: ${detalles.notas}`);
  }

  lines.push("\n_IdeasQSolucionan – Corte y Grabado CNC_");
  return lines.join("\n");
}

export function VistaClienteModal({
  open,
  onClose,
  catLabel,
  clienteNombre,
  result,
  detalles,
}: VistaClienteModalProps) {
  const [copied, setCopied] = useState(false);

  const text = buildWhatsAppText(catLabel, clienteNombre, result, detalles);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Texto copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWhatsApp() {
    const phone = detalles?.telefono?.replace(/\D/g, "") ?? "";
    const encoded = encodeURIComponent(text);
    const url = phone
      ? `https://wa.me/52${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="bottom"
        className="max-h-[88dvh] overflow-y-auto rounded-t-2xl px-4 pb-0"
      >
        <SheetHeader className="px-0 pb-4">
          <SheetTitle>Vista del cliente</SheetTitle>
        </SheetHeader>

        {/* Preview card */}
        <div className="rounded-xl border bg-[#f0fdf4] px-4 py-4 text-sm font-mono whitespace-pre-wrap leading-relaxed text-[#1a1a1a] mb-4">
          {text}
        </div>

        <Separator className="mb-4" />

        <div className="flex flex-col gap-2 pb-8">
          <Button
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white"
            onClick={handleWhatsApp}
          >
            <MessageCircleIcon className="size-4" />
            Abrir en WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon className="size-4 text-green-600" />
            ) : (
              <CopyIcon className="size-4" />
            )}
            {copied ? "¡Copiado!" : "Copiar texto"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
