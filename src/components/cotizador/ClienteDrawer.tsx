"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { CAT_CONFIG } from "@/lib/categoryConfig";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ClienteSuggestion {
  id: string;
  nombre: string;
  telefono: string | null;
  _count: { pedidos: number };
}

export function ClienteDrawer({ open, onClose }: Props) {
  const {
    currentCat,
    lastResult,
    clienteData,
    updateClienteData,
    resetClienteData,
    resetCurrentForm,
    cart,
    clearCart,
  } = useCotizadorStore();
  const [saving, setSaving] = useState(false);
  const cfg = CAT_CONFIG[currentCat];

  // Client search
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<ClienteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clientes?search=${encodeURIComponent(search.trim())}`);
        if (res.ok) {
          const data = await res.json() as ClienteSuggestion[];
          setSuggestions(data.slice(0, 6));
          setShowSuggestions(true);
        }
      } catch { /* ignore */ }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  function selectCliente(c: ClienteSuggestion) {
    updateClienteData({
      nombre: c.nombre,
      telefono: c.telefono ?? "",
      clienteId: c.id,
    });
    setSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

  const isCartMode = cart.length > 0;
  const grandTotal = isCartMode
    ? cart.reduce((s, i) => s + i.result.total, 0)
    : lastResult?.total ?? 0;
  const grandCosto = isCartMode
    ? cart.reduce((s, i) => s + i.result.costo, 0)
    : lastResult?.costo ?? 0;
  const grandIva = isCartMode
    ? cart.reduce((s, i) => s + i.result.iva, 0)
    : lastResult?.iva ?? 0;

  async function handleSave() {
    if (!isCartMode && (!lastResult || lastResult.total === 0)) return;
    setSaving(true);
    try {
      let payload: Record<string, unknown>;

      if (isCartMode) {
        payload = {
          items: cart.map((item) => ({
            categoria: item.categoria,
            catLabel: item.catLabel,
            emoji: item.emoji,
            total: item.result.total,
            costo: item.result.costo,
            iva: item.result.iva,
            formSnapshot: item.formSnapshot,
          })),
          clienteNombre: clienteData.nombre || "Sin nombre",
          clienteId: clienteData.clienteId || null,
          total: grandTotal,
          costo: grandCosto,
          iva: grandIva,
          fechaEntrega: clienteData.fechaEntrega || null,
          horaEntrega: clienteData.horaEntrega || null,
          telefono: clienteData.telefono || null,
          notas: clienteData.notas || null,
        };
      } else {
        const catState = useCotizadorStore.getState()[currentCat] as unknown as Record<string, unknown>;
        payload = {
          categoria: currentCat,
          catLabel: cfg.label,
          clienteNombre: clienteData.nombre || "Sin nombre",
          clienteId: clienteData.clienteId || null,
          total: lastResult!.total,
          costo: lastResult!.costo,
          iva: lastResult!.iva,
          detalles: { ...catState },
          fechaEntrega: clienteData.fechaEntrega || null,
          horaEntrega: clienteData.horaEntrega || null,
          telefono: clienteData.telefono || null,
          notas: clienteData.notas || null,
        };
      }

      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const data = await res.json();
      toast.success(`✅ Cotización #${String(data.folio).padStart(4, "0")} guardada`);

      if (isCartMode) {
        clearCart();
      } else {
        resetCurrentForm();
      }
      resetClienteData();
      onClose();
    } catch {
      toast.error("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const showSummary = isCartMode || (lastResult && lastResult.total > 0);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>Datos del cliente</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {isCartMode
              ? `${cart.length} producto${cart.length > 1 ? "s" : ""} · ${fmt(grandTotal)}`
              : `${cfg.label} · ${lastResult ? fmt(lastResult.total) : ""}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Client search */}
          <div className="space-y-1.5" ref={searchRef}>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Buscar cliente existente
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateClienteData({ clienteId: null });
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Nombre o teléfono…"
                className="pl-8"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                      onMouseDown={(e) => { e.preventDefault(); selectCliente(c); }}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <UserIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.nombre}</p>
                        {c.telefono && (
                          <p className="text-xs text-muted-foreground">{c.telefono}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {c._count.pedidos} pedido{c._count.pedidos !== 1 ? "s" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clienteData.clienteId && (
              <p className="text-[11px] text-green-600 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                Cliente vinculado
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Nombre del cliente
            </Label>
            <Input
              value={clienteData.nombre}
              onChange={(e) => updateClienteData({ nombre: e.target.value, clienteId: null })}
              placeholder="Ej: Cafetería El Sol"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Teléfono (opcional)
            </Label>
            <Input
              type="tel"
              value={clienteData.telefono}
              onChange={(e) => updateClienteData({ telefono: e.target.value })}
              placeholder="Ej: 555 123 4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Fecha entrega
              </Label>
              <Input
                type="date"
                value={clienteData.fechaEntrega}
                onChange={(e) => updateClienteData({ fechaEntrega: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Hora
              </Label>
              <Input
                type="time"
                value={clienteData.horaEntrega}
                onChange={(e) => updateClienteData({ horaEntrega: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Notas
            </Label>
            <Textarea
              value={clienteData.notas}
              onChange={(e) => updateClienteData({ notas: e.target.value })}
              placeholder="Colores, detalles, instrucciones..."
              className="min-h-[90px] resize-none"
            />
          </div>

          {showSummary && (
            <>
              <Separator />
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1.5">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                  Resumen
                </p>
                {isCartMode ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.emoji} {item.catLabel}</span>
                      <span className="font-medium text-foreground">{fmt(item.result.total)}</span>
                    </div>
                  ))
                ) : (
                  lastResult!.rows.map((row, i) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span>{row.label}</span>
                      <span className="font-medium text-foreground">{fmt(row.val)}</span>
                    </div>
                  ))
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold">{fmt(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border">
          <Button className={cn("w-full")} onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Guardando..." : "Confirmar y guardar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
