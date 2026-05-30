import { describe, expect, it } from "vitest";
import {
  flattenSlots,
  groupBookingsByDay,
  normalizePhone,
  parseTreatment,
  toBookingView,
} from "@/lib/cal/transforms";
import type { CalBooking, CalSlotsResponse } from "@/lib/cal/types";

describe("flattenSlots", () => {
  const response: CalSlotsResponse = {
    status: "success",
    data: {
      "2026-06-01": [
        { start: "2026-06-01T08:30:00.000-04:00" }, // before hours → filtered
        { start: "2026-06-01T10:00:00.000-04:00" },
        { start: "2026-06-01T09:00:00.000-04:00" },
        { start: "2026-06-01T17:00:00.000-04:00" }, // at close → filtered
      ],
      "2026-06-02": [
        { start: "2026-06-02T09:00:00.000-04:00" },
        { start: "2026-06-02T09:00:00.000-04:00" }, // duplicate
      ],
    },
  };

  it("filters to clinic hours, de-dupes, and sorts ascending", () => {
    expect(flattenSlots(response)).toEqual([
      "2026-06-01T09:00:00.000-04:00",
      "2026-06-01T10:00:00.000-04:00",
      "2026-06-02T09:00:00.000-04:00",
    ]);
  });

  it("respects the limit", () => {
    expect(flattenSlots(response, { limit: 1 })).toHaveLength(1);
  });

  it("returns [] for empty data", () => {
    expect(flattenSlots({ status: "success", data: {} })).toEqual([]);
  });
});

describe("normalizePhone", () => {
  it("prefixes a bare US 10-digit number", () => {
    expect(normalizePhone("7782957462")).toBe("+17782957462");
  });
  it("strips formatting", () => {
    expect(normalizePhone("(617) 555-0148")).toBe("+16175550148");
  });
  it("keeps an existing + and strips non-digits", () => {
    expect(normalizePhone("+1 778 295 7462")).toBe("+17782957462");
  });
  it("handles 11-digit leading-1", () => {
    expect(normalizePhone("17782957462")).toBe("+17782957462");
  });
});

describe("parseTreatment", () => {
  it("classifies known keywords", () => {
    expect(parseTreatment("Root Canal").category).toBe("root-canal");
    expect(parseTreatment("wisdom tooth extraction").category).toBe("extraction");
    expect(parseTreatment("Routine Cleaning").category).toBe("cleaning");
    expect(parseTreatment("new patient consultation").category).toBe("consultation");
  });
  it("falls back to consultation for empty input", () => {
    expect(parseTreatment("").category).toBe("consultation");
    expect(parseTreatment(null).category).toBe("consultation");
  });
  it("echoes unknown non-empty reasons as 'other'", () => {
    const r = parseTreatment("Aligner fitting");
    expect(r.category).toBe("other");
    expect(r.label).toContain("Aligner");
  });
});

function makeBooking(over: Partial<CalBooking>): CalBooking {
  return {
    id: 1,
    uid: "u1",
    title: "Dental Appointment",
    status: "accepted",
    start: "2026-06-01T13:00:00.000Z",
    end: "2026-06-01T13:30:00.000Z",
    attendees: [
      {
        name: "Jane Doe",
        email: "jane@example.com",
        phoneNumber: "+17782957462",
      },
    ],
    bookingFieldsResponses: { title: "Root Canal" },
    ...over,
  };
}

describe("toBookingView", () => {
  it("maps attendee + treatment + status", () => {
    const v = toBookingView(makeBooking({}));
    expect(v.patientName).toBe("Jane Doe");
    expect(v.patientEmail).toBe("jane@example.com");
    expect(v.patientPhone).toBe("+17782957462");
    expect(v.treatmentCategory).toBe("root-canal");
    expect(v.status).toBe("confirmed");
  });

  it("marks cancelled bookings", () => {
    expect(toBookingView(makeBooking({ status: "cancelled" })).status).toBe(
      "cancelled",
    );
  });

  it("handles a missing attendee gracefully", () => {
    const v = toBookingView(makeBooking({ attendees: [] }));
    expect(v.patientName).toBe("Unknown patient");
    expect(v.patientEmail).toBeNull();
  });
});

describe("groupBookingsByDay", () => {
  const now = new Date("2026-06-01T12:00:00Z"); // June 1, 08:00 ET

  it("groups by clinic day, sorts within day, and flags today", () => {
    const bookings = [
      makeBooking({ id: 2, uid: "b", start: "2026-06-01T18:00:00.000Z" }),
      makeBooking({ id: 1, uid: "a", start: "2026-06-01T14:00:00.000Z" }),
      makeBooking({ id: 3, uid: "c", start: "2026-06-03T14:00:00.000Z" }),
    ];
    const groups = groupBookingsByDay(bookings, now);

    expect(groups).toHaveLength(2);
    expect(groups[0].dateKey).toBe("2026-06-01");
    expect(groups[0].isToday).toBe(true);
    expect(groups[0].bookings.map((b) => b.uid)).toEqual(["a", "b"]); // time-sorted
    expect(groups[1].isToday).toBe(false);
  });
});
