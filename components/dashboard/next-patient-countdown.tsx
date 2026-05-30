"use client";

import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { relativeLabel } from "@/lib/time";

export function NextPatientCountdown({
  start,
  initial,
}: {
  start: string;
  initial: string;
}) {
  const [label, setLabel] = useState(initial);

  useEffect(() => {
    const tick = () =>
      setLabel((prev) => {
        const next = relativeLabel(start);
        return prev === next ? prev : next;
      });
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-accent ring-1 ring-inset ring-accent/25">
      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
