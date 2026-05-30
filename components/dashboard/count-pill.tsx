import { cn } from "@/lib/utils";

export function CountPill({
  value,
  unit,
  className,
}: {
  value: number;
  unit: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-medium capitalize text-muted shadow-sm",
        className,
      )}
    >
      <span className="font-semibold tabular-nums text-ink">{value}</span>
      {unit}
      {value === 1 ? "" : "s"}
    </span>
  );
}
