"use client";
import { cn } from "@/lib/utils";
import { CATEGORIES, CAT_CONFIG, Category } from "@/lib/categoryConfig";
import { useCotizadorStore } from "@/store/cotizadorStore";

export function CategoryPills() {
  const { currentCat, setCategory } = useCotizadorStore();

  return (
    <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto bg-background border-b border-border scrollbar-none">
      {CATEGORIES.map((cat) => {
        const cfg = CAT_CONFIG[cat];
        const isActive = cat === currentCat;
        return (
          <button
            key={cat}
            onClick={() => setCategory(cat as Category)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap flex-shrink-0 transition-all",
              isActive
                ? "text-white border-transparent"
                : "text-muted-foreground border-border bg-transparent hover:bg-muted"
            )}
            style={
              isActive
                ? { backgroundColor: cfg.color, borderColor: cfg.color }
                : {}
            }
          >
            <span className="text-[13px]">{cfg.emoji}</span>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
