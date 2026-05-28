import { KanbanBoard } from "@/components/produccion/KanbanBoard";

export const metadata = { title: "Producción · IQS" };

export default function ProduccionPage() {
  return (
    <div className="p-4 md:p-6 h-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Producción</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Seguimiento por producto de cada pedido activo
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
