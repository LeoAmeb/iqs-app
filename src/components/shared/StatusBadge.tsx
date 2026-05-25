import { PedidoStatus } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_CLASSES, cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PedidoStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_CLASSES[status], "border font-medium", className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
