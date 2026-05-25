"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, TrendingUpIcon, CalendarClockIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmt, fmtFecha, cn } from "@/lib/utils";
import type { PedidoStatus } from "@/generated/prisma";

interface EntregaProxima {
  id: string;
  clienteNombre: string;
  catLabel: string;
  fechaEntrega: string | null;
  status: PedidoStatus;
  total: number;
}

interface CatEntry {
  cat: string;
  ventas: number;
  cantidad: number;
}

interface DashboardData {
  mes: string;
  ventasMes: number;
  tickets: number;
  ticketProm: number;
  costos: number;
  ivas: number;
  ganancia: number;
  margen: number;
  meta: number;
  metaPct: number;
  porCategoria: CatEntry[];
  entregasProximas: EntregaProxima[];
  saldoPendiente: number;
  cantActivos: number;
}

function margenColor(pct: number) {
  if (pct >= 50) return "text-green-700";
  if (pct >= 25) return "text-yellow-600";
  return "text-red-600";
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () =>
      fetch("/api/dashboard").then((r) => {
        if (!r.ok) throw new Error("Error al cargar dashboard");
        return r.json();
      }),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2Icon className="size-8 animate-spin" />
        <p className="text-sm">Cargando dashboard…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm font-medium text-red-600">
          No se pudo cargar el dashboard
        </p>
      </div>
    );
  }

  const metaPctClamped = Math.min(data.metaPct, 100);
  const maxCatVentas = data.porCategoria[0]?.ventas ?? 1;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold capitalize">
            {new Date(data.mes + "-01").toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-xs text-muted-foreground">
            {data.cantActivos} pedido{data.cantActivos !== 1 ? "s" : ""} activo
            {data.cantActivos !== 1 ? "s" : ""} &middot; Saldo{" "}
            <span className={data.saldoPendiente > 0 ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
              {fmt(data.saldoPendiente)}
            </span>
          </p>
        </div>
        <TrendingUpIcon className="size-5 text-muted-foreground" />
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ventas del mes — full width */}
        <Card className="col-span-2">
          <CardHeader className="pb-1">
            <CardDescription>Ventas del mes</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {fmt(data.ventasMes)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.tickets} pedido{data.tickets !== 1 ? "s" : ""} &middot;
              Ticket prom. {fmt(data.ticketProm)}
            </p>
          </CardContent>
        </Card>

        {/* Costos */}
        <Card size="sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Costos</CardDescription>
            <CardTitle className="text-lg font-semibold">{fmt(data.costos)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              IVA {fmt(data.ivas)}
            </p>
          </CardContent>
        </Card>

        {/* Ganancia */}
        <Card size="sm">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Ganancia neta</CardDescription>
            <CardTitle className="text-lg font-semibold">{fmt(data.ganancia)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn("text-xs font-semibold", margenColor(data.margen))}>
              Margen {Math.round(data.margen)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Meta progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Meta mensual</CardDescription>
            <span className="text-xs font-medium text-muted-foreground">
              {Math.round(data.metaPct)}% de {fmt(data.meta)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={metaPctClamped} className="h-2.5" />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {fmt(data.ventasMes)} de {fmt(data.meta)}
          </p>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      {data.porCategoria.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm">Por categoría</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {data.porCategoria.map((entry) => {
                const pct = maxCatVentas > 0 ? (entry.ventas / maxCatVentas) * 100 : 0;
                return (
                  <div key={entry.cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{entry.cat}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.cantidad} pza{entry.cantidad !== 1 ? "s" : ""}</span>
                        <span className="font-semibold text-foreground">
                          {fmt(entry.ventas)}
                        </span>
                      </div>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming deliveries */}
      {data.entregasProximas.length > 0 && (
        <Card>
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <CalendarClockIcon className="size-4 text-muted-foreground" />
              <CardTitle className="text-sm">Entregas próximas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2">
              {data.entregasProximas.map((e, idx) => {
                const hoy = isToday(e.fechaEntrega);
                return (
                  <div key={e.id}>
                    {idx > 0 && <Separator className="my-2" />}
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2",
                        hoy ? "bg-red-50" : "bg-amber-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {e.clienteNombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {e.catLabel}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StatusBadge status={e.status} />
                          <p className="mt-1 text-xs text-muted-foreground">
                            {fmt(e.total)}
                          </p>
                        </div>
                      </div>
                      {e.fechaEntrega && (
                        <p
                          className={cn(
                            "mt-1 text-xs font-medium",
                            hoy ? "text-red-700" : "text-amber-700"
                          )}
                        >
                          {hoy ? "Hoy · " : "Mañana · "}
                          {fmtFecha(e.fechaEntrega)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
