"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PackageIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PedidoCard, type Pedido } from "@/components/pedidos/PedidoCard";
import { PedidoModal } from "@/components/pedidos/PedidoModal";
import { fmt, cn } from "@/lib/utils";

type Filtro = "todos" | "activos" | "entregados";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos" },
  { value: "entregados", label: "Entregados" },
];

export default function PedidosPage() {
  const [filtro, setFiltro] = useState<Filtro>("activos");
  const [selected, setSelected] = useState<Pedido | null>(null);

  const { data: pedidos = [], isLoading } = useQuery<Pedido[]>({
    queryKey: ["pedidos", filtro],
    queryFn: () =>
      fetch(`/api/pedidos?filtro=${filtro}`).then((r) => {
        if (!r.ok) throw new Error("Error al cargar pedidos");
        return r.json();
      }),
  });

  // Summary stats (only meaningful for activos / todos)
  const activos = pedidos.filter(
    (p) => p.status !== "ENTREGADO" && p.status !== "CANCELADO"
  );
  const saldoPendiente = activos.reduce(
    (acc, p) => acc + (p.total - p.anticipo),
    0
  );

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Filter buttons */}
      <div className="flex gap-1.5 rounded-xl bg-muted/50 p-1">
        {FILTROS.map((f) => (
          <Button
            key={f.value}
            variant={filtro === f.value ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 text-sm",
              filtro !== f.value && "text-muted-foreground"
            )}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Summary bar */}
      {!isLoading && pedidos.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{activos.length}</span>{" "}
            pedido{activos.length !== 1 ? "s" : ""} activo
            {activos.length !== 1 ? "s" : ""}
          </span>
          {saldoPendiente > 0 && (
            <>
              <span className="text-border">&middot;</span>
              <span>
                Saldo pendiente:{" "}
                <span className="font-semibold text-red-600">
                  {fmt(saldoPendiente)}
                </span>
              </span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2Icon className="size-8 animate-spin" />
          <p className="text-sm">Cargando pedidos…</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <PackageIcon className="size-12 stroke-[1.25]" />
          <p className="text-sm font-medium">No hay pedidos</p>
          <p className="text-xs">
            {filtro === "activos"
              ? "No tienes pedidos activos en este momento."
              : filtro === "entregados"
              ? "Aún no hay pedidos entregados."
              : "No hay pedidos registrados."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onClick={setSelected}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <PedidoModal
        pedido={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
