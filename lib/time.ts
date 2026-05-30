import { addDays, addMinutes, differenceInMinutes, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { CLINIC_HOURS, CLINIC_TZ, SLOT_DURATION_MIN } from "./constants";

const HAS_OFFSET = /(Z|[+-]\d{2}:\d{2})$/;

export function normalizeStartToUtcIso(input: string): string {
  const trimmed = input.trim();
  const date = HAS_OFFSET.test(trimmed)
    ? new Date(trimmed)
    : fromZonedTime(trimmed, CLINIC_TZ);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Unparseable timestamp: ${input}`);
  }
  return date.toISOString();
}

/** True if the slot's clinic-local start falls inside operational hours. */
export function isWithinClinicHours(iso: string): boolean {
  const hour = Number(formatInTimeZone(new Date(iso), CLINIC_TZ, "H"));
  const minute = Number(formatInTimeZone(new Date(iso), CLINIC_TZ, "m"));
  const minutesOfDay = hour * 60 + minute;
  return (
    minutesOfDay >= CLINIC_HOURS.start * 60 &&
    minutesOfDay < CLINIC_HOURS.end * 60
  );
}

export function clinicDateKey(iso: string | Date): string {
  return formatInTimeZone(toDate(iso), CLINIC_TZ, "yyyy-MM-dd");
}

export function clinicDayLabel(iso: string | Date): string {
  return formatInTimeZone(toDate(iso), CLINIC_TZ, "EEEE — MMMM d, yyyy");
}

export function clinicTimeLabel(iso: string | Date): string {
  return formatInTimeZone(toDate(iso), CLINIC_TZ, "hh:mm a");
}

export function clinicTimeRangeLabel(startIso: string, endIso?: string): string {
  const end = endIso ?? addMinutes(new Date(startIso), SLOT_DURATION_MIN).toISOString();
  return `${clinicTimeLabel(startIso)} – ${clinicTimeLabel(end)}`;
}

export function todayClinicDateKey(now: Date = new Date()): string {
  return clinicDateKey(now);
}

export function isClinicToday(iso: string | Date, now: Date = new Date()): boolean {
  return clinicDateKey(iso) === clinicDateKey(now);
}

export function minutesUntil(iso: string | Date, now: Date = new Date()): number {
  return differenceInMinutes(toDate(iso), now);
}

export function relativeLabel(iso: string | Date, now: Date = new Date()): string {
  const nowFloored = now.getTime() - (now.getTime() % 60_000);
  const diffMs = toDate(iso).getTime() - nowFloored;
  if (diffMs <= -60_000) return "In progress"; // started over a minute ago
  if (diffMs <= 0) return "Now";
  const totalMin = Math.floor(diffMs / 60_000);
  if (totalMin < 1) return "In under a min";
  if (totalMin < 60) return `In ${totalMin} min${totalMin === 1 ? "" : "s"}`;
  if (totalMin < 1440) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const hLabel = `${h} hr${h === 1 ? "" : "s"}`;
    return m === 0 ? `In ${hLabel}` : `In ${hLabel} ${m} min`;
  }
  const days = Math.floor(totalMin / 1440);
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

export function addDaysToDateKey(dateKey: string, n: number): string {
  return formatInTimeZone(addDays(parseISO(`${dateKey}T00:00:00Z`), n), "UTC", "yyyy-MM-dd");
}

export function nextCalendarDay(dateKey: string): string {
  return addDaysToDateKey(dateKey, 1);
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}
