import type { BookingDayGroup, BookingView, TreatmentCategory } from "@/types";

export interface BookingFilters {
  q: string;
  status: "all" | "confirmed" | "cancelled";
  treatment: TreatmentCategory | "all";
}

export function bookingMatches(b: BookingView, f: BookingFilters): boolean {
  if (f.status !== "all" && b.status !== f.status) return false;
  if (f.treatment !== "all" && b.treatmentCategory !== f.treatment) return false;

  const needle = f.q.trim().toLowerCase();
  if (!needle) return true;

  // Name + email are matched as plain text. Phone is matched only via its digits
  // (below) so a short query like "61" doesn't accidentally hit a phone number.
  const hay = `${b.patientName} ${b.patientEmail ?? ""}`.toLowerCase();
  if (hay.includes(needle)) return true;

  // Digits-only phone match so "5550172" matches "+1 (617) 555-0172".
  const needleDigits = needle.replace(/\D/g, "");
  const phoneDigits = (b.patientPhone ?? "").replace(/\D/g, "");
  return needleDigits.length >= 3 && phoneDigits.includes(needleDigits);
}

/** Apply filters to day groups, dropping any day left with no matches. */
export function filterGroups(
  groups: BookingDayGroup[],
  f: BookingFilters,
): BookingDayGroup[] {
  return groups
    .map((g) => ({ ...g, bookings: g.bookings.filter((b) => bookingMatches(b, f)) }))
    .filter((g) => g.bookings.length > 0);
}
