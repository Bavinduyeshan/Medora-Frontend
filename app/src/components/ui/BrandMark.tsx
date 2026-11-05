import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  compact = false,
  inverse = false,
}: {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          inverse ? "bg-white/15 text-white" : "bg-brand-600 text-white",
        )}
      >
        <Plus className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[25px] font-bold tracking-[-0.045em]",
            inverse ? "text-white" : "text-ink-950",
          )}
        >
          medora<span className="text-brand-400">.</span>
        </span>
      )}
    </span>
  );
}
