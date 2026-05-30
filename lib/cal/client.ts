import "server-only";
import { CAL_API_VERSION, CAL_REQUEST_TIMEOUT_MS, CLINIC_TZ } from "@/lib/constants";
import { env } from "@/lib/env";
import type {
  CalBookingResponse,
  CalBookingsListResponse,
  CalErrorBody,
  CalResult,
  CalSlotsResponse,
} from "./types";

type CalVersion = (typeof CAL_API_VERSION)[keyof typeof CAL_API_VERSION];

interface CalFetchOpts {
  method?: "GET" | "POST";
  version: CalVersion;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

async function calFetch<T>(
  path: string,
  { method = "GET", version, query, body }: CalFetchOpts,
): Promise<CalResult<T>> {
  const url = new URL(`${env.CAL_API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAL_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.CAL_API_KEY}`,
        "cal-api-version": version,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Bookings/slots change constantly — never serve a cached upstream read.
      cache: "no-store",
    });

    const json = (await res.json().catch(() => null)) as
      | (T & { status?: string })
      | CalErrorBody
      | null;

    if (!res.ok || (json as CalErrorBody)?.status === "error") {
      const errBody = json as CalErrorBody | null;
      const message = errBody?.error?.details?.message ?? errBody?.error?.message;
      return {
        ok: false,
        httpStatus: res.status,
        code: errBody?.error?.code,
        message,
      };
    }

    return { ok: true, data: json as T };
  } catch (err) {
    // AbortError (timeout) or a network failure. Surface a uniform 0/“network”.
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      httpStatus: 0,
      code: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
      message: isAbort
        ? "Upstream request timed out."
        : "Could not reach the scheduling service.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** Available slots for the event type within [start, end], in clinic tz. */
export function getSlots(args: {
  start: string;
  end: string;
}): Promise<CalResult<CalSlotsResponse>> {
  return calFetch<CalSlotsResponse>("/slots", {
    version: CAL_API_VERSION.slots,
    query: {
      eventTypeId: env.CAL_EVENT_TYPE_ID,
      start: args.start,
      end: args.end,
      timeZone: CLINIC_TZ,
    },
  });
}

/** Create a booking. `startUtc` must be an absolute UTC ISO instant. */
export function createBooking(args: {
  startUtc: string;
  name: string;
  email: string;
  phoneNumber: string;
  title: string;
  notes?: string;
}): Promise<CalResult<CalBookingResponse>> {
  return calFetch<CalBookingResponse>("/bookings", {
    method: "POST",
    version: CAL_API_VERSION.bookings,
    body: {
      eventTypeId: env.CAL_EVENT_TYPE_ID_NUM,
      start: args.startUtc,
      attendee: {
        name: args.name,
        email: args.email,
        phoneNumber: args.phoneNumber,
        timeZone: CLINIC_TZ,
        language: "en",
      },
      bookingFieldsResponses: {
        title: args.title,
        ...(args.notes ? { notes: args.notes } : {}),
      },
    },
  });
}

/** Cancel a booking by id or uid. */
export function cancelBooking(args: {
  bookingId: string;
  reason?: string;
}): Promise<CalResult<CalBookingResponse>> {
  return calFetch<CalBookingResponse>(
    `/bookings/${encodeURIComponent(args.bookingId)}/cancel`,
    {
      method: "POST",
      version: CAL_API_VERSION.bookings,
      body: { cancellationReason: args.reason ?? "Cancelled via SIMBA Care" },
    },
  );
}

export function listBookings(args: {
  status: "upcoming" | "cancelled" | "past";
  take?: number;
  afterStart?: string;
  beforeStart?: string;
  sortStart?: "asc" | "desc";
}): Promise<CalResult<CalBookingsListResponse>> {
  return calFetch<CalBookingsListResponse>("/bookings", {
    version: CAL_API_VERSION.bookings,
    query: {
      status: args.status,
      take: args.take ?? 100,
      eventTypeId: env.CAL_EVENT_TYPE_ID,
      sortStart: args.sortStart ?? "asc",
      afterStart: args.afterStart,
      beforeStart: args.beforeStart,
    },
  });
}
