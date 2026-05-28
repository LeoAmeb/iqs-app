"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UsersIcon,
  PlusIcon,
  Loader2Icon,
  SearchIcon,
  PhoneIcon,
  PackageIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmt, folioStr, fmtFecha } from "@/lib/utils";
import type { PedidoStatus } from "@/generated/prisma/client";

interface PedidoResumen {
  id: string;
  folio: number;
  catLabel: string;
  total: number;
  status: PedidoStatus;
  fechaEntrega: string | null;
  createdAt: string;
}

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  createdAt: string;
  _count: { pedidos: number };
  pedidos?: PedidoResumen[];
}

type SheetMode = "crear" | "editar" | null;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ClienteForm({
  initialData,
  onSave,
  onCancel,
  isSaving,
}: {
  initialData?: Partial<Cliente>;
  onSave: (data: {
    nombre: string;
    telefono: string;
    email: string;
    notas: string;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [notas, setNotas] = useState(initialData?.notas ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="cl-nombre">
          Nombre <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cl-nombre"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cl-tel">Teléfono</Label>
        <Input
          id="cl-tel"
          type="tel"
          placeholder="55 1234 5678"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cl-email">Email</Label>
        <Input
          id="cl-email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cl-notas">Notas</Label>
        <Textarea
          id="cl-notas"
          placeholder="Observaciones sobre el cliente…"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1"
          onClick={() => onSave({ nombre, telefono, email, notas })}
          disabled={isSaving || !nombre.trim()}
        >
          {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : null}
          Guardar
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Full detail for editing (includes pedidos)
  const { data: clienteDetail, isLoading: loadingDetail } = useQuery<Cliente>({
    queryKey: ["clientes", selectedCliente?.id],
    queryFn: () =>
      fetch(`/api/clientes/${selectedCliente!.id}`).then((r) => r.json()),
    enabled: !!selectedCliente?.id && sheetMode === "editar",
  });

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ["clientes", debouncedSearch],
    queryFn: () => {
      const qs = debouncedSearch
        ? `?search=${encodeURIComponent(debouncedSearch)}`
        : "";
      return fetch(`/api/clientes${qs}`).then((r) => {
        if (!r.ok) throw new Error("Error al cargar clientes");
        return r.json();
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      nombre: string;
      telefono: string;
      email: string;
      notas: string;
    }) => {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear cliente");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cliente creado");
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setSheetMode(null);
    },
    onError: () => toast.error("No se pudo crear el cliente"),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      nombre: string;
      telefono: string;
      email: string;
      notas: string;
    }) => {
      if (!selectedCliente) return;
      const res = await fetch(`/api/clientes/${selectedCliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar cliente");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Cliente actualizado");
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setSheetMode(null);
      setSelectedCliente(null);
    },
    onError: () => toast.error("No se pudo actualizar el cliente"),
  });

  const openEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setSheetMode("editar");
  };

  const closeSheet = () => {
    setSheetMode(null);
    setSelectedCliente(null);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Header actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nombre o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => setSheetMode("crear")}
        >
          <PlusIcon className="size-4" />
          Nuevo
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2Icon className="size-8 animate-spin" />
          <p className="text-sm">Cargando clientes…</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <UsersIcon className="size-12 stroke-[1.25]" />
          <p className="text-sm font-medium">
            {debouncedSearch
              ? "Sin resultados para esa búsqueda"
              : "No hay clientes registrados"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {clientes.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => openEdit(cliente)}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 active:bg-muted ring-1 ring-foreground/10"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{cliente.nombre}</p>
                {cliente.telefono && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <PhoneIcon className="size-3" />
                    {cliente.telefono}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <PackageIcon className="size-3.5" />
                <span>{cliente._count.pedidos}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create Sheet */}
      <Sheet open={sheetMode === "crear"} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-4 pb-0">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>Nuevo cliente</SheetTitle>
          </SheetHeader>
          <ClienteForm
            onSave={(data) => createMutation.mutate(data)}
            onCancel={closeSheet}
            isSaving={isSaving}
          />
          <div className="pb-8" />
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={sheetMode === "editar"} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl px-4 pb-0">
          <SheetHeader className="px-0 pb-4">
            <SheetTitle>
              {selectedCliente?.nombre ?? "Editar cliente"}
            </SheetTitle>
          </SheetHeader>

          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ClienteForm
                initialData={clienteDetail ?? selectedCliente ?? undefined}
                onSave={(data) => updateMutation.mutate(data)}
                onCancel={closeSheet}
                isSaving={isSaving}
              />

              {/* Pedidos history */}
              {clienteDetail?.pedidos && clienteDetail.pedidos.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="mb-3 text-sm font-semibold">Últimos pedidos</p>
                  <div className="space-y-2 pb-8">
                    {clienteDetail.pedidos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm ring-1 ring-foreground/5"
                      >
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-medium">
                            <span className="text-muted-foreground text-xs">
                              {folioStr(p.folio)}
                            </span>
                            {p.catLabel}
                          </p>
                          {p.fechaEntrega && (
                            <p className="text-xs text-muted-foreground">
                              {fmtFecha(p.fechaEntrega)}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <StatusBadge status={p.status} />
                          <span className="text-xs font-semibold">{fmt(p.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {clienteDetail?.pedidos?.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground pb-8">
                  Este cliente no tiene pedidos aún.
                </p>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
