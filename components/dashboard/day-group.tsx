import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { clinicTimeLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { BookingDayGroup } from "@/types";
import { BookingCard } from "./booking-card";
import { CountPill } from "./count-pill";
import { NowMarker } from "./now-marker";

export function DayGroup({
  group,
  nextUid,
  now = new Date(),
  withNowMarker = true,
}: {
  group: BookingDayGroup;
  nextUid?: string | null;
  now?: Date;
  withNowMarker?: boolean;
}) {
  const count = group.bookings.length;
  const nowMs = now.getTime();

  const nowIndex =
    withNowMarker && group.isToday
      ? (() => {
          const idx = group.bookings.findIndex(
            (b) => new Date(b.start).getTime() >= nowMs,
          );
          return idx === -1 ? count : idx;
        })()
      : -1;

  const showNow = withNowMarker && group.isToday;
  const rowCount = count + (showNow ? 1 : 0);
  const initialNowTime = clinicTimeLabel(now);

  const rows: ReactNode[] = [];
  let row = 0;
  const pushNow = () => {
    rows.push(
      <NowMarker
        key="now"
        time={initialNowTime}
        isFirst={row === 0}
        isLast={row === rowCount - 1}
      />,
    );
    row++;
  };

  group.bookings.forEach((b, i) => {
    if (showNow && i === nowIndex) pushNow();
    rows.push(
      <BookingCard
        key={b.uid}
        booking={b}
        isFirst={row === 0}
        isLast={row === rowCount - 1}
        isNext={b.uid === nextUid}
      />,
    );
    row++;
  });
  if (showNow && nowIndex === count) pushNow();

  return (
    <section className="space-y-2">
      {/* Sticky day header — pins below the page header until the next day takes over. */}
      <div className="sticky top-[68px] z-[5] -mx-1 flex items-baseline gap-3 rounded-lg bg-canvas/80 px-1 py-2 backdrop-blur-sm">
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {group.isToday ? "Today" : group.dayLabel}
        </h2>
        {group.isToday && (
          <span className="text-sm font-normal text-muted">{group.dayLabel}</span>
        )}
        <CountPill value={count} unit="appointment" className="ml-auto shrink-0" />
      </div>

      <Card
        className={cn(
          "overflow-hidden p-2 sm:p-3",
          group.isToday && "border-primary/35 ring-1 ring-inset ring-primary/10",
        )}
      >
        {rows}
      </Card>
    </section>
  );
}
