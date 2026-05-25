"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export function MigracionBanner() {
  const [hasDatos, setHasDatos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const ped = localStorage.getItem("iqs_ped");
      if (ped) {
        const arr = JSON.parse(ped);
        if (Array.isArray(arr) && arr.length > 0) setHasDatos(true);
      }
    } catch {
      // no hay datos o localStorage no disponible
    }
  }, []);

  if (!hasDatos || dismissed) return null;

  async function handleMigrar() {
    setLoading(true);
    try {
      const hist = JSON.parse(localStorage.getItem("iqs_hist") ?? "[]");
      const ped = JSON.parse(localStorage.getItem("iqs_ped") ?? "[]");

      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historial: hist, pedidos: ped }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("iqs_hist");
        localStorage.removeItem("iqs_ped");
        localStorage.removeItem("iqs_folio");
        toast.success(`✅ ${data.imported} pedidos importados (${data.skipped} omitidos)`);
        setHasDatos(false);
      } else {
        toast.error("Error al importar datos");
      }
    } catch {
      toast.error("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-4 mt-3 border-blue-200 bg-blue-50">
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-blue-900">Datos anteriores detectados</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Tenemos pedidos guardados en este dispositivo. ¿Importarlos a la nube?
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={handleMigrar} disabled={loading}>
                {loading ? "Importando..." : "Sí, importar"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600" onClick={() => setDismissed(true)}>
                No, descartar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
