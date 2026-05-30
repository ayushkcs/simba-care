import { cn } from "@/lib/utils";

type RailVariant = "active" | "next" | "muted" | "now";

export function TimelineRail({
  isFirst = false,
  isLast = false,
  variant = "active",
}: {
  isFirst?: boolean;
  isLast?: boolean;
  variant?: RailVariant;
}) {
  const lineClass =
    isFirst && isLast
      ? "hidden"
      : isFirst
        ? "top-1/2 bottom-0"
        : isLast
          ? "top-0 bottom-1/2"
          : "inset-y-0";

  return (
    <div className="relative flex w-9 shrink-0 justify-center sm:w-12">
      {/* connecting spine (painted before the node so the node sits on top) */}
      <span aria-hidden className={cn("absolute w-px bg-line", lineClass)} />

      {/* expanding halo for the imminent appointment */}
      {variant === "next" && (
        <span
          aria-hidden
          className="simba-pulse-ring absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full text-primary"
        />
      )}

      {/* node — the ring-4 ring-surface halo masks the line behind it */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full ring-4 ring-surface",
          variant === "now"
            ? "h-3 w-3 bg-primary"
            : variant === "next"
              ? "h-2.5 w-2.5 bg-primary"
              : variant === "muted"
                ? "h-2.5 w-2.5 border border-rose-300 bg-surface"
                : "h-2.5 w-2.5 bg-primary/35",
        )}
      />
    </div>
  );
}
