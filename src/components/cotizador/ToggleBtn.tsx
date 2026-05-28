import { cn } from "@/lib/utils";

interface ToggleBtnProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ToggleBtn({ active, onClick, children, className }: ToggleBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg border text-xs transition-all",
        active
          ? "bg-primary border-primary text-primary-foreground font-medium"
          : "bg-background border-border text-muted-foreground hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}
