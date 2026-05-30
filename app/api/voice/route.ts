import { NextResponse } from "next/server";
import { cancelBooking, createBooking, getSlots } from "@/lib/cal/client";
import type { CalResult } from "@/lib/cal/types";
import { flattenSlots, normalizePhone } from "@/lib/cal/transforms";
import { CLINIC_TZ, DEFAULT_APPOINTMENT_TITLE } from "@/lib/constants";
import {
  voicePayloadSchema,
  type CancelBookingPayload,
  type CheckAvailabilityPayload,
  type CreateBookingPayload,
} from "@/lib/schemas";
import { addDaysToDateKey, clinicTimeLabel, normalizeStartToUtcIso } from "@/lib/time";
import type { ApiResponse, ApiStatus } from "@/types";

/**
 * THE single voice-agent endpoint.
 *
 * One POST handler switches on `body.action`:
 *   • check_availability  → returns bookable slots (or next-day alternatives)
 *   • create_booking      → books an appointment (conflict-aware)
 *   • cancel_booking      → cancels and frees the slot
 *
 * Every response uses the same envelope: { status, message?, data? }.
 * `status` ∈ success | error | unavailable | conflict — chosen so the voice
 * agent can branch the conversation without parsing prose.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOOKAHEAD_DAYS = 7;

function envelope<T>(
  body: ApiResponse<T>,
  httpStatus: number,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(body, { status: httpStatus });
}

const ok = <T>(data: T, message?: string) =>
  envelope({ status: "success" as ApiStatus, message, data }, 200);

const badRequest = (message: string) =>
  envelope({ status: "error" as ApiStatus, message }, 400);

/**
 * Map a failed upstream call to a clean, caller-safe envelope. Never leaks the
 * raw Cal.com error or the API key; logs the detail server-side for debugging.
 */
function mapCalError(result: Extract<CalResult<unknown>, { ok: false }>) {
  console.error("[cal] upstream error", {
    httpStatus: result.httpStatus,
    code: result.code,
    message: result.message,
  });

  if (result.code === "TIMEOUT") {
    return envelope(
      { status: "error", message: "The scheduling service took too long. Please try again." },
      504,
    );
  }
  if (result.httpStatus === 0) {
    return envelope(
      { status: "error", message: "Couldn't reach the scheduling service. Please try again." },
      502,
    );
  }
  if (result.httpStatus === 429) {
    return envelope(
      { status: "error", message: "The scheduling service is busy right now. Please try again in a moment." },
      429,
    );
  }
  if (result.httpStatus === 401 || result.httpStatus === 403) {
    // Auth/config problem — never expose specifics to the caller.
    return envelope(
      { status: "error", message: "Scheduling service is temporarily unavailable." },
      502,
    );
  }
  return envelope(
    { status: "error", message: "Something went wrong with the scheduling service. Please try again." },
    502,
  );
}

/** A 400 from Cal.com on a booking means the slot is taken or unavailable. */
function isConflict(result: Extract<CalResult<unknown>, { ok: false }>): boolean {
  if (result.httpStatus !== 400) return false;
  return /already has (a )?booking|not available|no longer available|slot|conflict|busy/i.test(
    result.message ?? "",
  );
}

/**
 * A 400 from Cal.com about the booking-field responses (e.g. an unparseable
 * phone number) is a caller *input* problem, not an upstream failure — so we
 * surface it as a clean 400 with a helpful hint instead of a generic error.
 * Returns the caller-facing message, or null if this isn't an input error.
 */
function invalidBookingInput(
  result: Extract<CalResult<unknown>, { ok: false }>,
): string | null {
  if (result.httpStatus !== 400) return null;
  const msg = result.message ?? "";
  if (/invalid_number|phonenumber/i.test(msg)) {
    return "That phone number isn't valid. Include the country code, e.g. +1 415 555 0123.";
  }
  if (/\bresponses\b\s*-/i.test(msg)) {
    return "Some booking details were invalid. Please check the fields and try again.";
  }
  return null;
}

// ── Action: check_availability ──────────────────────────────────────────────
async function handleCheckAvailability(payload: CheckAvailabilityPayload) {
  const result = await getSlots({ start: payload.startDate, end: payload.endDate });
  if (!result.ok) return mapCalError(result);

  const slots = flattenSlots(result.data);
  if (slots.length > 0) {
    return ok(
      { slots, timeZone: CLINIC_TZ },
      `${slots.length} slot${slots.length === 1 ? "" : "s"} available.`,
    );
  }

  // Edge case #1 — no availability in the requested window. Look ahead a week
  // starting the next calendar day and offer alternatives. HTTP 200, not error.
  const altStart = addDaysToDateKey(payload.endDate, 1);
  const altEnd = addDaysToDateKey(altStart, LOOKAHEAD_DAYS);
  const lookahead = await getSlots({ start: altStart, end: altEnd });
  const alternativeSlots = lookahead.ok ? flattenSlots(lookahead.data) : [];

  return envelope(
    {
      status: "unavailable",
      message:
        alternativeSlots.length > 0
          ? "No slots available for this timeframe. Here are the next available openings."
          : "No slots available for this timeframe, and none in the coming week.",
      data: { alternativeSlots, timeZone: CLINIC_TZ },
    },
    200,
  );
}

// ── Action: create_booking ──────────────────────────────────────────────────
async function handleCreateBooking(payload: CreateBookingPayload) {
  // Force the inbound time to an absolute UTC instant (clinic-local if naive).
  let startUtc: string;
  try {
    startUtc = normalizeStartToUtcIso(payload.start);
  } catch {
    return badRequest("Could not understand the requested time. Use an ISO-8601 timestamp.");
  }

  // The event type requires a title; use the stated reason, else a default.
  const title = payload.notes?.trim() || DEFAULT_APPOINTMENT_TITLE;

  const result = await createBooking({
    startUtc,
    name: payload.name,
    email: payload.email,
    phoneNumber: normalizePhone(payload.number),
    title,
    notes: payload.notes,
  });

  if (!result.ok) {
    // Edge case #2 — double booking / slot taken.
    if (isConflict(result)) {
      return envelope(
        { status: "conflict", message: "That slot was just taken. Please select another time." },
        200,
      );
    }
    // Bad attendee details (e.g. an invalid phone) → clean 400, not a 502.
    const inputError = invalidBookingInput(result);
    if (inputError) return badRequest(inputError);

    return mapCalError(result);
  }

  const b = result.data.data;
  return ok(
    {
      bookingId: b.uid,
      bookingUid: b.uid,
      numericId: b.id,
      start: b.start,
      end: b.end,
      timeZone: CLINIC_TZ,
      localTime: clinicTimeLabel(b.start),
    },
    `Booked ${payload.name} at ${clinicTimeLabel(b.start)} (${CLINIC_TZ}).`,
  );
}

// ── Action: cancel_booking ──────────────────────────────────────────────────
async function handleCancelBooking(payload: CancelBookingPayload) {
  const result = await cancelBooking({
    bookingId: payload.bookingId,
    reason: payload.reason,
  });

  if (!result.ok) {
    if (result.httpStatus === 404) {
      return envelope(
        { status: "error", message: "No booking found with that ID." },
        404,
      );
    }
    return mapCalError(result);
  }

  return ok(
    { bookingId: result.data.data.uid, status: result.data.data.status },
    "Appointment cancelled. That slot is available again.",
  );
}

export async function POST(request: Request) {
  // 1) Parse JSON safely — a voice agent may send a malformed body.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  // 2) Validate the payload (also enforces a known action).
  const parsed = voicePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.length ? `${first.path.join(".")}: ` : "";
    return badRequest(`${where}${first?.message ?? "Invalid request payload."}`);
  }

  // 3) Dispatch.
  try {
    switch (parsed.data.action) {
      case "check_availability":
        return await handleCheckAvailability(parsed.data);
      case "create_booking":
        return await handleCreateBooking(parsed.data);
      case "cancel_booking":
        return await handleCancelBooking(parsed.data);
    }
  } catch (err) {
    console.error("[/api/voice] unhandled error", err);
    return envelope(
      { status: "error", message: "An unexpected error occurred. Please try again." },
      500,
    );
  }
}

/** Friendly usage doc for anyone hitting the endpoint in a browser. */
export function GET() {
  return NextResponse.json({
    status: "success",
    message: "SIMBA Care voice endpoint. POST a JSON body with an `action`.",
    data: {
      actions: {
        check_availability: { action: "check_availability", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" },
        create_booking: {
          action: "create_booking",
          start: "ISO_TIMESTAMP",
          name: "Patient Name",
          email: "patient@email.com",
          number: "7782957462",
          notes: "Reason (e.g. Root Canal)",
        },
        cancel_booking: { action: "cancel_booking", bookingId: "ID_OR_UID", reason: "Patient requested cancellation" },
      },
      envelope: "{ status: success | error | unavailable | conflict, message?, data? }",
      timeZone: CLINIC_TZ,
    },
  });
}
