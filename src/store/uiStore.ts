"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiStore {
  /** Desktop: sidebar colapsado a solo íconos */
  sidebarCollapsed: boolean;
  /** Mobile: Sheet del sidebar abierto */
  sidebarOpen: boolean;
  toggleCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      toggleCollapsed: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "iqs-ui",
      // Solo persistimos el estado de colapso, no si el sheet estaba abierto
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
