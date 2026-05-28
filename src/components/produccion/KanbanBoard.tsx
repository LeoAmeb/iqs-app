"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PRODUCTION_STAGES, getStage } from "@/lib/productionConfig";
import { ItemDetailDrawer, type KanbanItem } from "./ItemDetailDrawer";
import { cn } from "@/lib/utils";
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-MX");

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function isOverdue(fechaEntrega: string | null): boolean {
  if (!fechaEntrega) return false;
  return new Date(fechaEntrega) < new Date();
}

// ── Card ─────────────────────────────────────────────────────────────────────

function KanbanCard({
  item,
  onClick,
}: {
  item: KanbanItem;
  onClick: () => void;
}) {
  const stage = getStage(item.status);
  const overdue = isOverdue(item.pedido.fechaEntrega) && item.status !== "Entregado";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-2">
        <span className="text-xl leading-none mt-0.5 shrink-0">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight truncate">
            {item.catLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {item.pedido.clienteNombre}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/60">
        <span className="text-xs font-semibold text-foreground">{fmt(item.total)}</span>
        <div className="flex items-center gap-1.5">
          {item.pedido.fechaEntrega && (
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-medium",
                overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Clock className="h-2.5 w-2.5 shrink-0" />
              {formatDate(item.pedido.fechaEntrega)}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            #{String(item.pedido.folio).padStart(4, "0")}
          </span>
        </div>
      </div>

      {/* Status dot */}
      <div
        className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: stage.color }}
      />
    </button>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  items,
  onCardClick,
}: {
  stage: typeof PRODUCTION_STAGES[number];
  items: KanbanItem[];
  onCardClick: (item: KanbanItem) => void;
}) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 mb-3">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <span className="text-sm font-semibold text-foreground">{stage.label}</span>
        <span
          className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${stage.color}1a`,
            color: stage.color,
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 relative">
        {items.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-border px-4 py-8 text-center"
            style={{ borderColor: `${stage.color}40` }}
          >
            <p className="text-xs text-muted-foreground">Sin productos</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="relative">
              <KanbanCard item={item} onClick={() => onCardClick(item)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────

export function KanbanBoard() {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KanbanItem | null>(null);

  const fetchItems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/produccion");
      if (!res.ok) throw new Error();
      const data = await res.json() as KanbanItem[];
      setItems(data);
      // Update selected item if open
      if (selectedItem) {
        const updated = data.find((i) => i.id === selectedItem.id);
        if (updated) setSelectedItem(updated);
      }
    } catch {
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function handleStatusChange(item: KanbanItem, newStatus: string) {
    // Optimistic update
    const updatedItem = { ...item, status: newStatus };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updatedItem : i)));
    setSelectedItem(updatedItem);

    const res = await fetch(`/api/pedidos/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Rollback
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      setSelectedItem(item);
      toast.error("Error al actualizar el estado");
      return;
    }

    const updated = await res.json() as KanbanItem;
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    setSelectedItem(updated);
  }

  const itemsByStatus = PRODUCTION_STAGES.reduce<Record<string, KanbanItem[]>>(
    (acc, stage) => {
      acc[stage.id] = items.filter((i) => i.status === stage.id);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground text-sm">Cargando producción…</div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <p className="text-xs text-muted-foreground">
            {items.length} producto{items.length !== 1 ? "s" : ""} en producción
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => fetchItems(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          <span className="text-xs">Actualizar</span>
        </Button>
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PRODUCTION_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={itemsByStatus[stage.id] ?? []}
            onCardClick={setSelectedItem}
          />
        ))}
      </div>

      {/* Item detail drawer */}
      <ItemDetailDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
