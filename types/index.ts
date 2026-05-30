/** Shared app-level types used across the API route and the dashboard. */

/** Every /api/voice response uses this envelope. `status` drives the agent. */
export type ApiStatus = "success" | "error" | "unavailable" | "conflict";

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  message?: string;
  data?: T;
}

/** Treatment classification parsed from a booking, used for dashboard badges. */
export type TreatmentCategory =
  | "consultation"
  | "cleaning"
  | "extraction"
  | "root-canal"
  | "filling"
  | "whitening"
  | "checkup"
  | "other";

/** Normalized booking shape the dashboard renders (decoupled from Cal.com). */
export interface BookingView {
  id: number;
  uid: string;
  /** UTC ISO. */
  start: string;
  /** UTC ISO. */
  end: string;
  status: "confirmed" | "cancelled";
  patientName: string;
  patientEmail: string | null;
  patientPhone: string | null;
  treatmentLabel: string;
  treatmentCategory: TreatmentCategory;
  notes: string | null;
}

/** A day's worth of bookings for the chronological feed. */
export interface BookingDayGroup {
  dateKey: string; // "yyyy-MM-dd" (clinic tz)
  dayLabel: string; // "Monday — June 1, 2026"
  isToday: boolean;
  bookings: BookingView[];
}
