"use client";
import { CAT_CONFIG, CATEGORIES, Category } from "@/lib/categoryConfig";
import { useCotizadorStore } from "@/store/cotizadorStore";

export function CategoryGrid() {
  const { setCategory } = useCotizadorStore();

  function handleSelect(cat: Category) {
    setCategory(cat);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-120px)] px-4 py-8">
      <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2">
        Nuevo cotizador
      </p>
      <h2 className="text-2xl font-bold mb-1 text-foreground tracking-tight">
        ¿Qué vas a cotizar?
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        Selecciona el tipo de producto
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {CATEGORIES.map((cat) => {
          const cfg = CAT_CONFIG[cat];
          return (
            <button
              key={cat}
              onClick={() => handleSelect(cat)}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border bg-card hover:bg-muted hover:border-muted-foreground/30 transition-all duration-150 cursor-pointer text-center"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${cfg.color}18` }}
              >
                {cfg.emoji}
              </div>
              <span className="text-[11px] font-semibold text-foreground leading-tight">
                {cfg.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
