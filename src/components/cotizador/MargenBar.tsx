import { cn } from "@/lib/utils";

interface Props {
  margen: number;
  ganancia: number;
}

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

export function MargenBar({ margen, ganancia }: Props) {
  const m = Math.max(0, Math.min(100, margen));
  const color =
    m >= 50 ? "bg-green-500" : m >= 25 ? "bg-yellow-500" : "bg-red-500";
  const textColor =
    m >= 50 ? "text-green-500" : m >= 25 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px]">
        <span className="text-muted-foreground">Margen real</span>
        <span className={cn("font-bold", textColor)}>{m.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", color)}
          style={{ width: `${m}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>0%</span>
        <span>
          Ganancia: <strong className="text-foreground">{fmt(ganancia)}</strong>
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}
