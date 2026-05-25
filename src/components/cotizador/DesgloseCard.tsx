import { CalcResult } from "@/lib/pricing";
import { Separator } from "@/components/ui/separator";
import { MargenBar } from "./MargenBar";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-MX");
}

export function DesgloseCard({ result }: { result: CalcResult }) {
  if (!result || result.total === 0) return null;

  return (
    <div className="bg-white border border-[#e2e2e2] rounded-[10px] p-3.5 mt-3.5">
      <p className="text-[10px] font-semibold tracking-widest text-[#a0a0a0] uppercase mb-2.5">
        Desglose
      </p>
      {result.rows.map((row, i) => (
        <div
          key={i}
          className="flex justify-between py-1.5 border-b border-[#f4f4f4] text-[13px]"
        >
          <span className="text-[#5c5c5c]">{row.label}</span>
          <span className="font-medium">{fmt(row.val)}</span>
        </div>
      ))}

      <Separator className="my-2" />

      <div className="flex justify-between text-[13px] py-1">
        <span className="text-[#5c5c5c]">Subtotal (sin IVA)</span>
        <span className="font-medium">{fmt(result.neto)}</span>
      </div>
      <div className="flex justify-between text-[13px] py-1">
        <span className="text-[#5c5c5c]">IVA absorbido (16%)</span>
        <span className="font-medium text-[#a0a0a0]">−{fmt(result.iva)}</span>
      </div>

      <Separator className="my-2" />

      <div className="flex justify-between items-center pt-1">
        <span className="text-[#111] font-semibold">Total</span>
        <span className="text-[22px] font-bold tracking-tight">{fmt(result.total)}</span>
      </div>

      <MargenBar margen={result.margen} ganancia={result.ganancia} />
    </div>
  );
}
