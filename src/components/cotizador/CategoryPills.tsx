"use client";
import { cn } from "@/lib/utils";
import { CATEGORIES, CAT_CONFIG, Category } from "@/lib/categoryConfig";
import { useCotizadorStore } from "@/store/cotizadorStore";

const ICON_MAP: Record<string, React.ReactNode> = {
  tag:                    <span>🏷</span>,
  bulb:                   <span>💡</span>,
  cake:                   <span>🎂</span>,
  cut:                    <span>✂️</span>,
  coffee:                 <span>☕</span>,
  "layout-board":         <span>🖼</span>,
  writing:                <span>✍️</span>,
  scissors:               <span>✂</span>,
  "adjustments-horizontal": <span>⚙️</span>,
};

export function CategoryPills() {
  const { currentCat, setCategory } = useCotizadorStore();

  return (
    <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-[#e2e2e2] bg-white sticky top-12 md:top-0 z-30 scrollbar-none">
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
                : "text-[#5c5c5c] border-[#e2e2e2] bg-transparent hover:bg-[#f4f4f4]"
            )}
            style={
              isActive
                ? { backgroundColor: cfg.color, borderColor: cfg.color }
                : {}
            }
          >
            <span className="text-[13px]">{ICON_MAP[cfg.icon] ?? "•"}</span>
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
