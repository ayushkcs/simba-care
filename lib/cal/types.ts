export interface CalSlotsResponse {
  status: "success" | "error";
  data: Record<string, Array<{ start: string }>>;
}

export interface CalAttendee {
  name: string;
  email: string;
  phoneNumber?: string | null;
  timeZone?: string;
  language?: string;
}

export interface CalBooking {
  id: number;
  uid: string;
  title: string;
  description?: string | null;
  status: "accepted" | "pending" | "cancelled" | "rejected" | string;
  start: string; // UTC ISO
  end: string; // UTC ISO
  duration?: number;
  eventTypeId?: number;
  cancellationReason?: string | null;
  attendees?: CalAttendee[];
  bookingFieldsResponses?: Record<string, unknown> & {
    title?: string;
    notes?: string;
  };
  location?: string | null;
  meetingUrl?: string | null;
}

export interface CalBookingResponse {
  status: "success" | "error";
  data: CalBooking;
}

export interface CalBookingsListResponse {
  status: "success" | "error";
  data: CalBooking[];
  pagination?: {
    totalItems: number;
    remainingItems: number;
  };
}

/** Shape Cal.com uses for error bodies. */
export interface CalErrorBody {
  status: "error";
  error?: {
    code?: string;
    message?: string;
    details?: { message?: string; statusCode?: number };
  };
}

export type CalResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      httpStatus: number;
      code?: string;
      message?: string;
    };
