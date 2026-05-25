"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/cotizador":  "Cotizador",
  "/pedidos":    "Pedidos",
  "/clientes":   "Clientes",
  "/usuarios":   "Usuarios",
};

/** Topbar visible solo en mobile (< md). En desktop el sidebar lleva logo y user. */
export function AppHeader() {
  const pathname = usePathname();
  const { setSidebarOpen } = useUiStore();
  const { data: session } = useSession();

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "IdeasQSolucionan";

  return (
    <header className="md:hidden flex items-center gap-3 px-4 h-12 border-b border-border bg-white sticky top-0 z-50">
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      {/* Page title */}
      <span className="flex-1 text-sm font-semibold text-foreground truncate">
        {title}
      </span>

      {/* User dropdown compacto */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold uppercase cursor-pointer hover:opacity-80 transition-opacity">
          {session?.user?.name?.charAt(0) ?? <User className="size-4" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            {session?.user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
