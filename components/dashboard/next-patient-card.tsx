import { clinicTimeLabel, minutesUntil, relativeLabel } from "@/lib/time";
import type { BookingView } from "@/types";
import { NextPatientAvatar } from "./next-patient-avatar";
import { NextPatientCountdown } from "./next-patient-countdown";
import { TreatmentBadge } from "./treatment-badge";

/** Highlight card for the very next patient — warm coral wash to stand apart. */
export function NextPatientCard({ patient }: { patient: BookingView | null }) {
  const shell =
    "relative h-full overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-surface p-5 shadow-[0_1px_2px_rgba(34,31,51,0.04),0_16px_32px_-20px_rgba(251,111,95,0.5)]";

  if (!patient) {
    return (
      <div className={`${shell} flex flex-col justify-center gap-1`}>
        <p className="text-sm font-medium text-accent">Next Patient</p>
        <p className="text-sm text-muted">No upcoming patients scheduled.</p>
      </div>
    );
  }

  return (
    <div className={`${shell} flex flex-col gap-3`}>
      {/* corner wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-accent">Next Patient</p>
        <NextPatientCountdown
          start={patient.start}
          initial={relativeLabel(patient.start)}
        />
      </div>

      <div className="flex items-center gap-3">
        <NextPatientAvatar
          name={patient.patientName}
          start={patient.start}
          initialMinutes={minutesUntil(patient.start)}
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-ink">
            {patient.patientName}
          </p>
          <p className="text-sm text-muted">{clinicTimeLabel(patient.start)}</p>
        </div>
      </div>

      <div>
        <TreatmentBadge
          category={patient.treatmentCategory}
          label={patient.treatmentLabel}
        />
      </div>
    </div>
  );
}
