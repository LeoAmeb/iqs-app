import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar, MobileSidebar } from "@/components/layout/AppSidebar";
import { MigracionBanner } from "@/components/shared/MigracionBanner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* ── Sidebar fijo (solo md+) ─────────────────────────── */}
      <div className="hidden md:flex shrink-0">
        <AppSidebar />
      </div>

      {/* ── Sheet sidebar mobile ────────────────────────────── */}
      <MobileSidebar />

      {/* ── Área de contenido ──────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <AppHeader />

        {/* Scroll container */}
        <main className="flex-1 overflow-y-auto">
          <MigracionBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
