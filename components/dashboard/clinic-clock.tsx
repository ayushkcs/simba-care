"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { CLINIC_TZ } from "@/lib/constants";

/**
 * Live clinic clock. Always renders in the clinic's timezone
 * (America/New_York) regardless of the viewer's location, and derives the
 * EDT/EST abbreviation automatically via Intl. Ticks every second but only
 * re-renders when the displayed minute actually changes.
 */
type Parts = { time: string; date: string; tz: string };

function clinicParts(d: Date): Parts {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
  const tz =
    new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TZ, timeZoneName: "short" })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return { time, date, tz };
}

export function ClinicClock() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () =>
      setParts((prev) => {
        const next = clinicParts(new Date());
        // Bail out of re-render when nothing visible has changed.
        return prev && prev.time === next.time && prev.date === next.date
          ? prev
          : next;
      });
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs shadow-sm backdrop-blur-sm"
      aria-label="Current clinic time"
      title="Clinic local time (America/New_York)"
      suppressHydrationWarning
    >
      <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
      <span className="font-medium tabular-nums text-ink">
        {parts?.time ?? "—:—"}
      </span>
      <span className="hidden text-muted sm:inline">· {parts?.date ?? "—"}</span>
      <span className="text-muted">· {parts?.tz ?? "—"}</span>
    </div>
  );
}
