import { cn } from "@/lib/utils";
import type { SurvivalStatus } from "@/lib/lifepilot";

const styles: Record<string, { wrap: string; dot: string; label: string }> = {
  AFFORDABLE: {
    wrap: "bg-success-soft text-success border-success/20",
    dot: "bg-success",
    label: "Affordable",
  },
  TIGHT: {
    wrap: "bg-warning-soft text-warning border-warning/20",
    dot: "bg-warning",
    label: "Tight",
  },
  UNAFFORDABLE: {
    wrap: "bg-danger-soft text-danger border-danger/20",
    dot: "bg-danger",
    label: "Unaffordable",
  },
};

export function StatusBadge({ status, size = "md" }: { status: SurvivalStatus; size?: "md" | "lg" }) {
  const s = styles[status] ?? {
    wrap: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold",
        size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs",
        s.wrap,
      )}
    >
      <span className={cn("size-2 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
