"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserCogIcon,
  PlusIcon,
  Loader2Icon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircle2Icon,
  XCircleIcon,
  PencilIcon,
  KeyRoundIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma/client";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  _count: { pedidos: number; cotizaciones: number };
}

type SheetMode = "crear" | "editar" | null;

// ─── Formulario de usuario ────────────────────────────────────────────────────

function UsuarioForm({
  mode,
  initial,
  currentUserId,
  onSave,
  onCancel,
  isSaving,
}: {
  mode: SheetMode;
  initial?: Usuario;
  currentUserId?: string;
  onSave: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>(initial?.role ?? "EMPLEADO");

  const isEditing = mode === "editar";
  const isSelf = initial?.id === currentUserId;

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="u-name">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="u-name"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="u-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="u-email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isEditing} // No se puede cambiar email al editar
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            El email no se puede modificar.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="u-pass">
          {isEditing ? "Nueva contraseña" : "Contraseña"}
          {!isEditing && <span className="text-destructive"> *</span>}
        </Label>
        <Input
          id="u-pass"
          type="password"
          placeholder={
            isEditing ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Rol</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v ?? "EMPLEADO")}
          disabled={isSelf} // No puedes cambiar tu propio rol
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EMPLEADO">Empleado</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {isSelf && (
          <p className="text-xs text-muted-foreground">
            No puedes cambiar tu propio rol.
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          className="flex-1"
          onClick={() => onSave({ name, email, password, role })}
          disabled={
            isSaving ||
            !name.trim() ||
            (!isEditing && (!email.trim() || !password.trim()))
          }
        >
          {isSaving ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
          {isEditing ? "Guardar cambios" : "Crear usuario"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function UsuariosPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const qc = useQueryClient();

  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Usuario | null>(null);

  // Guardia de rol: solo ADMIN
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    router.replace("/dashboard");
    return null;
  }

  const { data: usuarios = [], isLoading } = useQuery<Usuario[]>({
    queryKey: ["usuarios"],
    queryFn: () =>
      fetch("/api/usuarios").then((r) => {
        if (!r.ok) throw new Error("Error al cargar usuarios");
        return r.json();
      }),
    enabled: status === "authenticated",
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al crear usuario");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Usuario creado");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      closeSheet();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      password: string;
      role: string;
    }) => {
      if (!selected) return;
      const payload: Record<string, string> = { name: data.name, role: data.role };
      if (data.password) payload.password = data.password;
      const res = await fetch(`/api/usuarios/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Usuario actualizado");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      closeSheet();
    },
    onError: () => toast.error("No se pudo actualizar el usuario"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error");
      }
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast.success(vars.active ? "Usuario activado" : "Usuario desactivado");
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      setConfirmDeactivate(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function closeSheet() {
    setSheetMode(null);
    setSelected(null);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserCogIcon className="size-5" />
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona el acceso al sistema
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => { setSelected(null); setSheetMode("crear"); }}
        >
          <PlusIcon className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      {/* Table / List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2Icon className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actividad</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {usuarios.map((u) => (
                  <tr key={u.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {u.role === "ADMIN" ? (
                          <ShieldCheckIcon className="size-3" />
                        ) : (
                          <UserIcon className="size-3" />
                        )}
                        {u.role === "ADMIN" ? "Admin" : "Empleado"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u._count.pedidos} pedidos · {u._count.cotizaciones} cotizaciones
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          u.active ? "text-green-700" : "text-red-600"
                        )}
                      >
                        {u.active ? (
                          <CheckCircle2Icon className="size-3.5" />
                        ) : (
                          <XCircleIcon className="size-3.5" />
                        )}
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Editar"
                          onClick={() => { setSelected(u); setSheetMode("editar"); }}
                        >
                          <PencilIcon className="size-3.5" />
                        </Button>
                        {u.id !== session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-7 w-7",
                              u.active
                                ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            )}
                            title={u.active ? "Desactivar" : "Activar"}
                            onClick={() =>
                              u.active
                                ? setConfirmDeactivate(u)
                                : toggleActiveMutation.mutate({ id: u.id, active: true })
                            }
                          >
                            {u.active ? (
                              <XCircleIcon className="size-3.5" />
                            ) : (
                              <CheckCircle2Icon className="size-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border bg-card p-4 ring-1 ring-foreground/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge
                    variant={u.role === "ADMIN" ? "default" : "secondary"}
                    className="shrink-0 text-xs gap-1"
                  >
                    {u.role === "ADMIN" ? (
                      <ShieldCheckIcon className="size-3" />
                    ) : (
                      <UserIcon className="size-3" />
                    )}
                    {u.role === "ADMIN" ? "Admin" : "Empleado"}
                  </Badge>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium flex items-center gap-1",
                      u.active ? "text-green-700" : "text-red-600"
                    )}
                  >
                    {u.active ? (
                      <CheckCircle2Icon className="size-3.5" />
                    ) : (
                      <XCircleIcon className="size-3.5" />
                    )}
                    {u.active ? "Activo" : "Inactivo"}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {u._count.pedidos} pedidos
                  </p>
                </div>

                <Separator className="my-3" />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => { setSelected(u); setSheetMode("editar"); }}
                  >
                    <PencilIcon className="size-3.5" />
                    Editar
                  </Button>
                  {u.id !== session?.user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 gap-1.5",
                        u.active
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      )}
                      onClick={() =>
                        u.active
                          ? setConfirmDeactivate(u)
                          : toggleActiveMutation.mutate({ id: u.id, active: true })
                      }
                    >
                      {u.active ? (
                        <>
                          <XCircleIcon className="size-3.5" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle2Icon className="size-3.5" />
                          Activar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {usuarios.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <UserCogIcon className="size-10 stroke-[1.25]" />
              <p className="text-sm font-medium">No hay usuarios registrados</p>
            </div>
          )}
        </>
      )}

      {/* Sheet crear / editar */}
      <Sheet
        open={sheetMode !== null}
        onOpenChange={(o) => { if (!o) closeSheet(); }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              {sheetMode === "crear" ? (
                <>
                  <PlusIcon className="size-4" />
                  Nuevo usuario
                </>
              ) : (
                <>
                  <KeyRoundIcon className="size-4" />
                  Editar usuario
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          <UsuarioForm
            mode={sheetMode}
            initial={selected ?? undefined}
            currentUserId={session?.user?.id}
            onSave={(data) => {
              if (sheetMode === "crear") {
                createMutation.mutate(data);
              } else {
                updateMutation.mutate(data);
              }
            }}
            onCancel={closeSheet}
            isSaving={isSaving}
          />
        </SheetContent>
      </Sheet>

      {/* Confirm deactivate dialog */}
      <AlertDialog
        open={!!confirmDeactivate}
        onOpenChange={(o) => { if (!o) setConfirmDeactivate(null); }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{confirmDeactivate?.name}</strong> no podrá iniciar sesión
              mientras esté inactivo. Podrás reactivarlo en cualquier momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeactivate(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDeactivate)
                  toggleActiveMutation.mutate({
                    id: confirmDeactivate.id,
                    active: false,
                  });
              }}
              disabled={toggleActiveMutation.isPending}
            >
              {toggleActiveMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
