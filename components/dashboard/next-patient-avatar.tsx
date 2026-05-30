"use client";

import { useEffect, useState } from "react";
import { minutesUntil } from "@/lib/time";

const WINDOW_MIN = 60;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NextPatientAvatar({
  name,
  start,
  initialMinutes,
}: {
  name: string;
  start: string;
  initialMinutes: number;
}) {
  const [mins, setMins] = useState(initialMinutes);

  useEffect(() => {
    const tick = () => setMins(minutesUntil(start));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start]);

  const progress =
    mins >= WINDOW_MIN ? 0 : Math.max(0, Math.min(1, (WINDOW_MIN - mins) / WINDOW_MIN));
  const deg = Math.round(progress * 360);

  return (
    <span
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--accent) ${deg}deg, var(--line) ${deg}deg)`,
      }}
    >
      <span className="flex h-[2.6rem] w-[2.6rem] items-center justify-center rounded-full bg-surface text-sm font-semibold tracking-wide text-accent">
        {initialsOf(name)}
      </span>
    </span>
  );
}
