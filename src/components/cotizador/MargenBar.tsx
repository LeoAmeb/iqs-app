import { Progress } from "@/components/ui/progress";
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
    m >= 50 ? "text-green-700" : m >= 25 ? "text-yellow-700" : "text-red-700";

  return (
    <div className="bg-white border border-[#e2e2e2] rounded-[10px] p-3 mt-2.5">
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-[#5c5c5c]">Margen real</span>
        <span className={cn("font-bold", textColor)}>{m.toFixed(1)}%</span>
      </div>
      <div className="h-[5px] bg-[#ececec] rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${m}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-[#a0a0a0] mt-1.5">
        <span>0%</span>
        <span className="text-[#5c5c5c]">Ganancia: <strong>{fmt(ganancia)}</strong></span>
        <span>100%</span>
      </div>
    </div>
  );
}
