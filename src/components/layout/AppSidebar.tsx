"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart2,
  Calculator,
  ClipboardList,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",  label: "Dashboard",  icon: BarChart2 },
  { href: "/cotizador",  label: "Cotizador",  icon: Calculator },
  { href: "/pedidos",    label: "Pedidos",    icon: ClipboardList },
  { href: "/clientes",   label: "Clientes",   icon: Users },
  { href: "/usuarios",   label: "Usuarios",   icon: UserCog, adminOnly: true },
];

// ─── Sidebar content (reutilizado en desktop y mobile Sheet) ──────────────────

function SidebarContent({
  collapsed,
  onClose,
}: {
  collapsed: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { toggleCollapsed } = useUiStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header: logo + collapse btn */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          collapsed ? "h-14 justify-center px-0" : "h-14 justify-between px-4"
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-black tracking-tight leading-none text-foreground">
              IDEAS<span className="font-black">QSOLUCIONAN</span>
            </p>
            <p className="text-[8px] font-semibold tracking-[2px] text-muted-foreground mt-0.5">
              CORTE Y GRABADO CNC
            </p>
          </div>
        )}

        {/* Desktop: toggle collapse button */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        {/* Mobile: close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0",
                      isActive ? "text-background" : "text-muted-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-border p-2")}>
        {collapsed ? (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Cerrar sesión"
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold uppercase">
              {session?.user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold leading-tight">
                {session?.user?.name ?? "Usuario"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground leading-tight">
                {session?.user?.role === "ADMIN" ? "Administrador" : "Empleado"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesión"
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop sidebar (siempre montado en md+) ─────────────────────────────────

export function AppSidebar() {
  const { sidebarCollapsed } = useUiStore();
  return <SidebarContent collapsed={sidebarCollapsed} />;
}

// ─── Mobile Sheet sidebar ─────────────────────────────────────────────────────

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="p-0 w-60 max-w-[80vw]">
        <SidebarContent
          collapsed={false}
          onClose={() => setSidebarOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
