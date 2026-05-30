export const CLINIC_NAME = "SIMBA Care";
export const CLINIC_TZ = "America/New_York";
export const CLINIC_HOURS = { start: 9, end: 17 } as const;
export const SLOT_DURATION_MIN = 30;
export const DAILY_SLOT_CAPACITY =
  ((CLINIC_HOURS.end - CLINIC_HOURS.start) * 60) / SLOT_DURATION_MIN;
export const CAL_API_VERSION = {
  slots: "2024-09-04",
  bookings: "2024-08-13",
  eventTypes: "2024-06-14",
} as const;
export const DEFAULT_APPOINTMENT_TITLE = "Dental Appointment";
export const MAX_SLOTS_RETURNED = 12;
export const PAST_WINDOWS = [15, 30, 90, 365] as const;
export const PAST_TAKE = 100;
export const CAL_REQUEST_TIMEOUT_MS = 10_000;
