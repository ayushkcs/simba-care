import { cn } from "@/lib/utils";

/** Live connection indicator: soft pulsing emerald dot when Cal.com is reachable. */
export function SyncBadge({ connected }: { connected: boolean }) {
  return (
    <span
      title={connected ? "Cal.com Connected" : "Cal.com Unreachable"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:px-3",
        connected
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-rose-50 text-rose-700 ring-rose-600/20",
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        {connected && (
          <span className="simba-pulse-ring absolute inline-flex h-2 w-2 text-emerald-500" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            connected ? "bg-emerald-500" : "bg-rose-500",
          )}
        />
      </span>
      <span className="hidden sm:inline">Cal.com</span>
    </span>
  );
}
