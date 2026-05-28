"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryPills } from "./CategoryPills";
import { DesgloseCard } from "./DesgloseCard";
import { ClienteDrawer } from "./ClienteDrawer";
import { LogosForm } from "./forms/LogosForm";
import { NeonForm } from "./forms/NeonForm";
import { ToppersForm } from "./forms/ToppersForm";
import { MdfForm } from "./forms/MdfForm";
import { TermosForm } from "./forms/TermosForm";
import { DisplaysForm } from "./forms/DisplaysForm";
import { GrabadoForm } from "./forms/GrabadoForm";
import { CorteForm } from "./forms/CorteForm";
import { PersonalizadoForm } from "./forms/PersonalizadoForm";
import { VistaClienteModal } from "@/components/shared/VistaClienteModal";
import { CAT_CONFIG } from "@/lib/categoryConfig";
import { ArrowLeft, Eye, ShoppingCart, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const FORM_MAP = {
  logos:         LogosForm,
  neon:          NeonForm,
  toppers:       ToppersForm,
  mdf:           MdfForm,
  termos:        TermosForm,
  displays:      DisplaysForm,
  grabado:       GrabadoForm,
  corte:         CorteForm,
  personalizado: PersonalizadoForm,
} as const;

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

export function CotizadorShell() {
  const {
    view,
    setView,
    currentCat,
    lastResult,
    clienteData,
    cart,
    addToCart,
    removeFromCart,
  } = useCotizadorStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vistaOpen, setVistaOpen] = useState(false);
  const FormComponent = FORM_MAP[currentCat];
  const cfg = CAT_CONFIG[currentCat];

  const cartTotal = cart.reduce((s, item) => s + item.result.total, 0);

  function handleAddToCart() {
    if (!lastResult || lastResult.total === 0) {
      toast.warning("Completa el formulario antes de agregar");
      return;
    }
    addToCart();
    toast.success(`${cfg.emoji} ${cfg.label} agregado al carrito`);
  }

  function handleGuardarClick() {
    if (cart.length === 0) {
      toast.warning("Agrega productos al carrito primero");
      return;
    }
    setDrawerOpen(true);
  }

  function handleVistaClick() {
    if (!lastResult || lastResult.total === 0) {
      toast.warning("Completa el formulario primero");
      return;
    }
    setVistaOpen(true);
  }

  // ── Grid de categorías ──────────────────────────────────────────────────────
  if (view === "grid") {
    return <CategoryGrid />;
  }

  // ── Vista de formulario ─────────────────────────────────────────────────────
  return (
    <>
      <div className="md:flex md:min-h-full">
        {/* ── Columna izquierda: formulario ─────────────────────────────── */}
        <div className="flex-1 md:overflow-y-auto">
          {/* Header sticky: volver + pills */}
          <div className="sticky top-0 z-20 bg-background border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setView("grid")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="text-xs">Cambiar</span>
              </Button>
              <div className="flex items-center gap-1.5 ml-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: cfg.color }}
                >
                  {cfg.emoji} {cfg.label}
                </span>
              </div>
            </div>
            <CategoryPills />
          </div>

          {/* Contenido del formulario (pb-24 para dar espacio a la barra mobile) */}
          <div className="p-4 pb-24 md:pb-8">
            <FormComponent />
            {lastResult && lastResult.total > 0 && (
              <div className="md:hidden">
                <DesgloseCard result={lastResult} />
              </div>
            )}
          </div>
        </div>

        {/* ── Columna derecha: carrito + desglose + acciones (solo desktop) ── */}
        <div className="hidden md:block w-[340px] shrink-0 border-l border-border">
          <div className="sticky top-0 h-screen overflow-y-auto flex flex-col p-5 bg-muted/20">

            {/* Cart items */}
            {cart.length > 0 && (
              <>
                <div className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-2.5">
                    Carrito ({cart.length})
                  </p>
                  <div className="space-y-1.5">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <span className="text-base leading-none">{item.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{item.catLabel}</p>
                          <p className="text-[11px] text-muted-foreground">{fmt(item.result.total)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2.5 px-0.5">
                    <span className="text-xs text-muted-foreground">Subtotal carrito</span>
                    <span className="text-sm font-bold">{fmt(cartTotal)}</span>
                  </div>
                </div>
                <Separator className="mb-4" />
              </>
            )}

            {/* Current result */}
            {lastResult && lastResult.total > 0 ? (
              <>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-4">
                  Resultado en tiempo real
                </p>
                <DesgloseCard result={lastResult} />
              </>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: `${cfg.color}18` }}
                >
                  {cfg.emoji}
                </div>
                <p className="text-sm text-muted-foreground">
                  Completa el formulario para ver el precio
                </p>
              </div>
            ) : null}

            {/* Botones de acción */}
            <div className="mt-auto pt-5 space-y-2">
              <Button
                className="w-full"
                size="lg"
                disabled={!lastResult || lastResult.total === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Agregar al carrito
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant={cart.length > 0 ? "default" : "outline"}
                disabled={cart.length === 0}
                onClick={handleGuardarClick}
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" />
                {cart.length > 0
                  ? `Guardar pedido (${cart.length})`
                  : "Guardar pedido"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!lastResult || lastResult.total === 0}
                onClick={handleVistaClick}
              >
                <Eye className="h-4 w-4 mr-1.5" />
                Vista cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones mobile (solo mobile) */}
      <div className="md:hidden sticky bottom-0 z-30 bg-background border-t border-border px-4 py-3 flex gap-2">
        <Button
          className="flex-1 h-10"
          disabled={!lastResult || lastResult.total === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          Agregar
        </Button>
        <Button
          variant={cart.length > 0 ? "default" : "outline"}
          className="h-10 px-3 relative"
          disabled={cart.length === 0}
          onClick={handleGuardarClick}
        >
          <ShoppingBag className="h-4 w-4" />
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 min-w-[1rem] flex items-center justify-center px-1 border border-background">
              {cart.length}
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          disabled={!lastResult || lastResult.total === 0}
          onClick={handleVistaClick}
          title="Vista cliente"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Drawer de datos del cliente */}
      <ClienteDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Modal vista cliente */}
      {lastResult && (
        <VistaClienteModal
          open={vistaOpen}
          onClose={() => setVistaOpen(false)}
          catLabel={cfg.label}
          clienteNombre={clienteData.nombre}
          result={lastResult}
          detalles={{
            fechaEntrega: clienteData.fechaEntrega,
            horaEntrega: clienteData.horaEntrega,
            notas: clienteData.notas,
            telefono: clienteData.telefono,
          }}
        />
      )}
    </>
  );
}
