"use client";

import { useEffect, useState } from "react";
import { CLINIC_TZ } from "@/lib/constants";
import { TimelineRail } from "./timeline-rail";

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: CLINIC_TZ,
});

export function NowMarker({
  time,
  isFirst = false,
  isLast = false,
}: {
  time: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  // Seeded with the server-computed time so SSR and first paint match.
  const [label, setLabel] = useState(time);

  useEffect(() => {
    const tick = () => setLabel(TIME_FMT.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex">
      <TimelineRail variant="now" isFirst={isFirst} isLast={isLast} />
      <div className="my-0.5 flex flex-1 items-center gap-3 py-1.5 pr-4">
        <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-fg shadow-sm">
          Now
        </span>
        <span className="text-xs font-semibold tabular-nums text-primary">{label}</span>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-primary/40 via-primary/15 to-transparent"
        />
      </div>
    </div>
  );
}
