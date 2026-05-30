import { describe, expect, it } from "vitest";
import { voicePayloadSchema } from "@/lib/schemas";

describe("voicePayloadSchema", () => {
  it("accepts a valid check_availability payload", () => {
    const r = voicePayloadSchema.safeParse({
      action: "check_availability",
      startDate: "2026-06-01",
      endDate: "2026-06-05",
    });
    expect(r.success).toBe(true);
  });

  it("rejects endDate before startDate", () => {
    const r = voicePayloadSchema.safeParse({
      action: "check_availability",
      startDate: "2026-06-05",
      endDate: "2026-06-01",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed date", () => {
    const r = voicePayloadSchema.safeParse({
      action: "check_availability",
      startDate: "06/01/2026",
      endDate: "2026-06-05",
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid create_booking payload", () => {
    const r = voicePayloadSchema.safeParse({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      name: "Jane Doe",
      email: "jane@example.com",
      number: "7782957462",
      notes: "Root Canal",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a bad email", () => {
    const r = voicePayloadSchema.safeParse({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      name: "Jane",
      email: "nope",
      number: "7782957462",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const r = voicePayloadSchema.safeParse({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      email: "jane@example.com",
      number: "7782957462",
    });
    expect(r.success).toBe(false);
  });

  it("accepts cancel_booking and coerces a numeric id to string", () => {
    const r = voicePayloadSchema.safeParse({
      action: "cancel_booking",
      bookingId: 20218984,
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.action === "cancel_booking") {
      expect(r.data.bookingId).toBe("20218984");
    }
  });

  it("rejects an unknown action", () => {
    const r = voicePayloadSchema.safeParse({ action: "frobnicate" });
    expect(r.success).toBe(false);
  });
});
