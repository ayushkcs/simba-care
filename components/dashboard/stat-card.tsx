import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  Icon,
  accent = "primary",
  children,
}: {
  label: string;
  value: string | number;
  hint?: string;
  Icon: LucideIcon;
  accent?: "primary" | "neutral" | "coral";
  /** Optional instrument (meter / split bar) rendered full-width below the value. */
  children?: React.ReactNode;
}) {
  const accents = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    neutral: "bg-surface-2 text-muted ring-line",
    coral: "bg-accent-soft text-accent ring-accent/20",
  } as const;

  return (
    <Card className="p-5 transition-shadow hover:shadow-[0_2px_4px_rgba(43,35,28,0.05),0_16px_32px_-20px_rgba(194,86,46,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted/80">{hint}</p>}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      {children}
    </Card>
  );
}
