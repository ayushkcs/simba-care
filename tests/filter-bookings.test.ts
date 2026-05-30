import { describe, expect, it } from "vitest";
import { bookingMatches, filterGroups } from "@/lib/filter-bookings";
import type { BookingDayGroup, BookingView } from "@/types";

function makeBooking(overrides: Partial<BookingView> = {}): BookingView {
  return {
    id: 1,
    uid: "uid-1",
    start: "2026-06-01T14:00:00Z",
    end: "2026-06-01T14:30:00Z",
    status: "confirmed",
    patientName: "John Doe",
    patientEmail: "john.doe@example.com",
    patientPhone: "+16175550172",
    treatmentLabel: "Root Canal",
    treatmentCategory: "root-canal",
    notes: null,
    ...overrides,
  };
}

const ALL = { q: "", status: "all", treatment: "all" } as const;

describe("bookingMatches", () => {
  it("matches everything when no filters are set", () => {
    expect(bookingMatches(makeBooking(), ALL)).toBe(true);
  });

  it("matches by name (case-insensitive)", () => {
    expect(bookingMatches(makeBooking(), { ...ALL, q: "john" })).toBe(true);
    expect(bookingMatches(makeBooking(), { ...ALL, q: "JOHN DOE" })).toBe(true);
    expect(bookingMatches(makeBooking(), { ...ALL, q: "jane" })).toBe(false);
  });

  it("matches by email substring", () => {
    expect(bookingMatches(makeBooking(), { ...ALL, q: "doe@example" })).toBe(true);
  });

  it("matches by phone digits regardless of formatting", () => {
    expect(bookingMatches(makeBooking(), { ...ALL, q: "5550172" })).toBe(true);
    expect(bookingMatches(makeBooking(), { ...ALL, q: "(617) 555-0172" })).toBe(true);
    expect(bookingMatches(makeBooking(), { ...ALL, q: "9999999" })).toBe(false);
  });

  it("does not phone-match on fewer than 3 digits", () => {
    // "61" appears in the number but is too short to be a deliberate search.
    expect(
      bookingMatches(makeBooking({ patientName: "Zed" }), { ...ALL, q: "61" }),
    ).toBe(false);
  });

  it("narrows by status", () => {
    const cancelled = makeBooking({ status: "cancelled" });
    expect(bookingMatches(cancelled, { ...ALL, status: "cancelled" })).toBe(true);
    expect(bookingMatches(cancelled, { ...ALL, status: "confirmed" })).toBe(false);
  });

  it("narrows by treatment category", () => {
    expect(bookingMatches(makeBooking(), { ...ALL, treatment: "root-canal" })).toBe(
      true,
    );
    expect(bookingMatches(makeBooking(), { ...ALL, treatment: "cleaning" })).toBe(
      false,
    );
  });

  it("combines filters with AND semantics", () => {
    const b = makeBooking({ status: "cancelled" });
    expect(
      bookingMatches(b, { q: "john", status: "cancelled", treatment: "root-canal" }),
    ).toBe(true);
    // wrong status → excluded even though name + treatment match
    expect(
      bookingMatches(b, { q: "john", status: "confirmed", treatment: "root-canal" }),
    ).toBe(false);
  });
});

describe("filterGroups", () => {
  const groups: BookingDayGroup[] = [
    {
      dateKey: "2026-06-01",
      dayLabel: "Monday — June 1, 2026",
      isToday: false,
      bookings: [
        makeBooking({ uid: "a", patientName: "John Doe", patientEmail: "john@x.com" }),
        makeBooking({
          uid: "b",
          patientName: "Jane Roe",
          patientEmail: "jane@x.com",
          status: "cancelled",
        }),
      ],
    },
    {
      dateKey: "2026-06-02",
      dayLabel: "Tuesday — June 2, 2026",
      isToday: false,
      bookings: [
        makeBooking({ uid: "c", patientName: "Sam Smith", patientEmail: "sam@x.com" }),
      ],
    },
  ];

  it("keeps only matching bookings and drops emptied days", () => {
    const result = filterGroups(groups, { ...ALL, q: "john" });
    expect(result).toHaveLength(1);
    expect(result[0].bookings.map((b) => b.uid)).toEqual(["a"]);
  });

  it("drops every day when nothing matches", () => {
    expect(filterGroups(groups, { ...ALL, q: "nobody" })).toHaveLength(0);
  });

  it("does not mutate the input groups", () => {
    filterGroups(groups, { ...ALL, status: "cancelled" });
    expect(groups[0].bookings).toHaveLength(2);
  });
});
