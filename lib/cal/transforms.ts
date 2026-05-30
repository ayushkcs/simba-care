import { MAX_SLOTS_RETURNED } from "@/lib/constants";
import {
  clinicDateKey,
  clinicDayLabel,
  isClinicToday,
  isWithinClinicHours,
} from "@/lib/time";
import type { BookingDayGroup, BookingView, TreatmentCategory } from "@/types";
import type { CalBooking, CalSlotsResponse } from "./types";

export function flattenSlots(
  response: CalSlotsResponse,
  { limit = MAX_SLOTS_RETURNED }: { limit?: number } = {},
): string[] {
  const byDate = response.data ?? {};
  const starts = Object.values(byDate)
    .flat()
    .map((s) => s.start)
    .filter((start) => isWithinClinicHours(start));

  const unique = Array.from(new Set(starts));
  unique.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return unique.slice(0, limit);
}

export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`; // bare US number
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

const TREATMENT_RULES: Array<{
  category: TreatmentCategory;
  label: string;
  match: RegExp;
}> = [
  { category: "root-canal", label: "Root Canal", match: /root\s*canal|endodont/i },
  {
    category: "extraction",
    label: "Extraction",
    match: /extract|pull|wisdom|tooth removal/i,
  },
  { category: "cleaning", label: "Cleaning", match: /clean|hygiene|scal|polish/i },
  { category: "whitening", label: "Whitening", match: /whiten|bleach/i },
  { category: "filling", label: "Filling", match: /fill|cavity|caries/i },
  {
    category: "checkup",
    label: "Check-up",
    match: /check[\s-]?up|routine|exam|x-?ray/i,
  },
  {
    category: "consultation",
    label: "Consultation",
    match: /consult|new patient|advice|opinion/i,
  },
];

export function parseTreatment(text: string | null | undefined): {
  category: TreatmentCategory;
  label: string;
} {
  const haystack = (text ?? "").trim();
  if (haystack) {
    for (const rule of TREATMENT_RULES) {
      if (rule.match.test(haystack)) {
        return { category: rule.category, label: rule.label };
      }
    }
    // Unknown but non-empty: show the caller's own words, title-cased-ish.
    return { category: "other", label: truncate(haystack, 28) };
  }
  return { category: "consultation", label: "Consultation" };
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function firstNonEmpty(...vals: Array<unknown>): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Map a raw Cal.com booking to the dashboard's normalized BookingView. */
export function toBookingView(b: CalBooking): BookingView {
  const attendee = b.attendees?.[0];
  const fields = b.bookingFieldsResponses ?? {};
  const reason = firstNonEmpty(fields.title, fields.notes, b.description);
  const treatment = parseTreatment(reason);

  return {
    id: b.id,
    uid: b.uid,
    start: b.start,
    end: b.end,
    status:
      b.status === "cancelled" || b.status === "rejected" ? "cancelled" : "confirmed",
    patientName:
      firstNonEmpty(attendee?.name, fields.name as string) ?? "Unknown patient",
    patientEmail: firstNonEmpty(attendee?.email, fields.email as string),
    patientPhone: firstNonEmpty(
      attendee?.phoneNumber,
      fields.attendeePhoneNumber as string,
    ),
    treatmentLabel: treatment.label,
    treatmentCategory: treatment.category,
    notes: firstNonEmpty(fields.notes, b.description),
  };
}

export function groupBookingsByDay(
  bookings: CalBooking[],
  now: Date = new Date(),
  order: "asc" | "desc" = "asc",
): BookingDayGroup[] {
  const views = bookings.map(toBookingView);
  const groups = new Map<string, BookingView[]>();

  for (const view of views) {
    const key = clinicDateKey(view.start);
    const bucket = groups.get(key);
    if (bucket) bucket.push(view);
    else groups.set(key, [view]);
  }

  const dir = order === "desc" ? -1 : 1;

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b) * dir)
    .map(([dateKey, dayBookings]) => ({
      dateKey,
      dayLabel: clinicDayLabel(`${dateKey}T12:00:00Z`),
      isToday: isClinicToday(dayBookings[0].start, now),
      bookings: dayBookings.sort(
        (a, b) => (new Date(a.start).getTime() - new Date(b.start).getTime()) * dir,
      ),
    }));
}
