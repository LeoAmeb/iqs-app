import { CalcResult } from "@/lib/pricing";
import { Separator } from "@/components/ui/separator";
import { MargenBar } from "./MargenBar";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

export function DesgloseCard({ result }: { result: CalcResult }) {
  if (!result || result.total === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-4">
      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3">
        Desglose
      </p>
      {result.rows.map((row, i) => (
        <div
          key={i}
          className="flex justify-between py-1.5 border-b border-border/50 text-[13px]"
        >
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-medium text-foreground">{fmt(row.val)}</span>
        </div>
      ))}

      <Separator className="my-3" />

      <div className="flex justify-between text-[13px] py-1">
        <span className="text-muted-foreground">Subtotal (sin IVA)</span>
        <span className="font-medium text-foreground">{fmt(result.neto)}</span>
      </div>
      <div className="flex justify-between text-[13px] py-1">
        <span className="text-muted-foreground">IVA absorbido (16%)</span>
        <span className="font-medium text-muted-foreground">−{fmt(result.iva)}</span>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between items-center pt-1">
        <span className="text-foreground font-semibold">Total</span>
        <span className="text-[26px] font-bold tracking-tight text-foreground">{fmt(result.total)}</span>
      </div>

      <div className="mt-3">
        <MargenBar margen={result.margen} ganancia={result.ganancia} />
      </div>
    </div>
  );
}
