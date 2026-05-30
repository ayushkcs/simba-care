import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Cal.com client so these tests are offline + deterministic, and so
// lib/env (which requires real credentials) is never loaded.
vi.mock("@/lib/cal/client", () => ({
  getSlots: vi.fn(),
  createBooking: vi.fn(),
  cancelBooking: vi.fn(),
}));

import { cancelBooking, createBooking, getSlots } from "@/lib/cal/client";
import { POST } from "@/app/api/voice/route";

const mockGetSlots = vi.mocked(getSlots);
const mockCreateBooking = vi.mocked(createBooking);
const mockCancelBooking = vi.mocked(cancelBooking);

function post(body: unknown, raw = false) {
  return POST(
    new Request("http://localhost/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );
}

const slots = (starts: string[]) => ({
  ok: true as const,
  data: { status: "success" as const, data: { day: starts.map((start) => ({ start })) } },
});

beforeEach(() => vi.clearAllMocks());

describe("POST /api/voice — validation", () => {
  it("400s on malformed JSON", async () => {
    const res = await post("{not json", true);
    expect(res.status).toBe(400);
    expect((await res.json()).status).toBe("error");
  });

  it("400s on an unknown action", async () => {
    const res = await post({ action: "frobnicate" });
    expect(res.status).toBe(400);
  });

  it("400s on a bad email for create_booking", async () => {
    const res = await post({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      name: "Jane",
      email: "nope",
      number: "7782957462",
    });
    expect(res.status).toBe(400);
  });
});

describe("check_availability", () => {
  it("returns success with filtered slots", async () => {
    mockGetSlots.mockResolvedValueOnce(slots(["2026-06-01T10:00:00.000-04:00"]));
    const res = await post({
      action: "check_availability",
      startDate: "2026-06-01",
      endDate: "2026-06-01",
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("success");
    expect(body.data.slots).toHaveLength(1);
  });

  it("returns 'unavailable' with next-day alternatives when empty", async () => {
    mockGetSlots
      .mockResolvedValueOnce(slots([])) // requested window empty
      .mockResolvedValueOnce(slots(["2026-06-02T09:00:00.000-04:00"])); // lookahead
    const res = await post({
      action: "check_availability",
      startDate: "2026-06-01",
      endDate: "2026-06-01",
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("unavailable");
    expect(body.data.alternativeSlots).toHaveLength(1);
  });

  it("maps a 429 to a graceful error", async () => {
    mockGetSlots.mockResolvedValueOnce({
      ok: false,
      httpStatus: 429,
      message: "rate limited",
    });
    const res = await post({
      action: "check_availability",
      startDate: "2026-06-01",
      endDate: "2026-06-01",
    });
    expect(res.status).toBe(429);
    expect((await res.json()).status).toBe("error");
  });
});

describe("create_booking", () => {
  it("books and returns the uid", async () => {
    mockCreateBooking.mockResolvedValueOnce({
      ok: true,
      data: {
        status: "success",
        data: {
          id: 1,
          uid: "abc",
          title: "t",
          status: "accepted",
          start: "2026-06-01T14:00:00.000Z",
          end: "2026-06-01T14:30:00.000Z",
        },
      },
    });
    const res = await post({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      name: "Jane Doe",
      email: "jane@example.com",
      number: "7782957462",
      notes: "Root Canal",
    });
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.data.bookingId).toBe("abc");

    // Inbound naive time must be normalized to UTC before going upstream.
    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({ startUtc: "2026-06-01T14:00:00.000Z", title: "Root Canal" }),
    );
  });

  it("returns 'conflict' on a double booking", async () => {
    mockCreateBooking.mockResolvedValueOnce({
      ok: false,
      httpStatus: 400,
      message: "User either already has booking at this time or is not available",
    });
    const res = await post({
      action: "create_booking",
      start: "2026-06-01T10:00:00",
      name: "Jane Doe",
      email: "jane@example.com",
      number: "7782957462",
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("conflict");
  });
});

describe("cancel_booking", () => {
  it("cancels successfully", async () => {
    mockCancelBooking.mockResolvedValueOnce({
      ok: true,
      data: { status: "success", data: { uid: "abc", status: "cancelled" } as never },
    });
    const res = await post({ action: "cancel_booking", bookingId: "abc" });
    expect((await res.json()).status).toBe("success");
  });

  it("404s for an unknown booking", async () => {
    mockCancelBooking.mockResolvedValueOnce({
      ok: false,
      httpStatus: 404,
      message: "not found",
    });
    const res = await post({ action: "cancel_booking", bookingId: "nope" });
    expect(res.status).toBe(404);
  });
});
