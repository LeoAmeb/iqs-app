"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useCotizadorStore } from "@/store/cotizadorStore";
import { CategoryPills } from "./CategoryPills";
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
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function CotizadorShell() {
  const { currentCat, lastResult, resetCurrentForm } = useCotizadorStore();
  const [saving, setSaving] = useState(false);
  const [vistaOpen, setVistaOpen] = useState(false);
  const FormComponent = FORM_MAP[currentCat];

  async function handleGuardar() {
    if (!lastResult || lastResult.total === 0) {
      toast.warning("Completa el formulario antes de guardar");
      return;
    }
    const store = useCotizadorStore.getState();
    const catState = store[currentCat] as unknown as Record<string, unknown>;

    setSaving(true);
    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: currentCat,
          catLabel: CAT_CONFIG[currentCat].label,
          clienteNombre: (catState.cliente as string) || "Sin nombre",
          total: lastResult.total,
          costo: lastResult.costo,
          iva: lastResult.iva,
          detalles: catState,
          fechaEntrega: catState.fechaEntrega || null,
          horaEntrega: catState.horaEntrega || null,
          telefono: catState.telefono || null,
          notas: catState.notas || null,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      const data = await res.json();
      toast.success(`✅ Cotización #${String(data.folio).padStart(4, "0")} guardada`);
      resetCurrentForm();
    } catch {
      toast.error("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // Selector reactivo: se actualiza cuando cambian los campos del form activo
  const catState = useCotizadorStore(
    (s) => s[currentCat]
  ) as unknown as Record<string, unknown>;

  return (
    <>
      <CategoryPills />

      {/* Action bar */}
      <div className="flex gap-2 px-4 py-2.5 border-b border-[#e2e2e2] bg-white sticky top-[calc(3rem+46px)] md:top-[46px] z-20">
        <Button
          className="flex-1 h-9 text-sm font-semibold"
          onClick={handleGuardar}
          disabled={saving}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {saving ? "Guardando..." : "Guardar cotización"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          title="Vista cliente"
          onClick={() => {
            if (!lastResult || lastResult.total === 0) {
              toast.warning("Completa el formulario primero");
              return;
            }
            setVistaOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* Formulario activo */}
      <div className="p-4 pb-8">
        <FormComponent />
      </div>

      {/* Vista cliente modal */}
      {lastResult && (
        <VistaClienteModal
          open={vistaOpen}
          onClose={() => setVistaOpen(false)}
          catLabel={CAT_CONFIG[currentCat].label}
          clienteNombre={(catState.cliente as string) || ""}
          result={lastResult}
          detalles={{
            fechaEntrega: catState.fechaEntrega as string | undefined,
            horaEntrega: catState.horaEntrega as string | undefined,
            notas: catState.notas as string | undefined,
            telefono: catState.telefono as string | undefined,
          }}
        />
      )}
    </>
  );
}
