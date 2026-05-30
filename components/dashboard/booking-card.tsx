import { Mail, Phone } from "lucide-react";
import { clinicTimeRangeLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { BookingView } from "@/types";
import { StatusBadge } from "./status-badge";
import { TimelineRail } from "./timeline-rail";
import { TreatmentBadge } from "./treatment-badge";

/** A single appointment row in the chronological feed, hung off the day spine. */
export function BookingCard({
  booking,
  isFirst = false,
  isLast = false,
  isNext = false,
}: {
  booking: BookingView;
  isFirst?: boolean;
  isLast?: boolean;
  isNext?: boolean;
}) {
  const cancelled = booking.status === "cancelled";
  const variant = cancelled ? "muted" : isNext ? "next" : "active";

  return (
    <div className="relative flex">
      <TimelineRail isFirst={isFirst} isLast={isLast} variant={variant} />

      <div
        className={cn(
          "my-0.5 flex flex-1 flex-col gap-4 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:gap-6",
          cancelled
            ? "rounded-xl bg-rose-50/40 opacity-60"
            : isNext
              ? "rounded-xl bg-accent-soft/50 ring-1 ring-inset ring-primary/15"
              : "rounded-xl hover:bg-surface-2",
        )}
      >
        {/* Time slot — prominent, tabular, fixed-width column on desktop. */}
        <div className="sm:w-44 sm:shrink-0">
          <p className="text-sm font-semibold tabular-nums text-ink">
            {clinicTimeRangeLabel(booking.start, booking.end)}
          </p>
        </div>

        {/* Patient identity + contact. */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{booking.patientName}</p>
          <div className="mt-1 flex flex-col gap-x-4 gap-y-0.5 text-sm text-muted sm:flex-row sm:flex-wrap">
            {booking.patientEmail && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-muted/70" aria-hidden />
                <span className="truncate">{booking.patientEmail}</span>
              </span>
            )}
            {booking.patientPhone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-muted/70" aria-hidden />
                {booking.patientPhone}
              </span>
            )}
          </div>
        </div>

        {/* Treatment + status badges. */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <TreatmentBadge
            category={booking.treatmentCategory}
            label={booking.treatmentLabel}
          />
          <StatusBadge status={booking.status} />
        </div>
      </div>
    </div>
  );
}
