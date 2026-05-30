import { describe, expect, it } from "vitest";
import {
  clinicDateKey,
  isWithinClinicHours,
  minutesUntil,
  nextCalendarDay,
  normalizeStartToUtcIso,
  relativeLabel,
} from "@/lib/time";

describe("normalizeStartToUtcIso", () => {
  it("treats a naive timestamp as clinic-local during EDT (June = -04:00)", () => {
    // 10:00 in New York in June is 14:00 UTC.
    expect(normalizeStartToUtcIso("2026-06-01T10:00:00")).toBe(
      "2026-06-01T14:00:00.000Z",
    );
  });

  it("treats a naive timestamp as clinic-local during EST (January = -05:00)", () => {
    // 10:00 in New York in January is 15:00 UTC — library handles the DST flip.
    expect(normalizeStartToUtcIso("2026-01-15T10:00:00")).toBe(
      "2026-01-15T15:00:00.000Z",
    );
  });

  it("respects an explicit offset", () => {
    expect(normalizeStartToUtcIso("2026-06-01T10:00:00-04:00")).toBe(
      "2026-06-01T14:00:00.000Z",
    );
  });

  it("respects an explicit UTC 'Z'", () => {
    expect(normalizeStartToUtcIso("2026-06-01T14:00:00Z")).toBe(
      "2026-06-01T14:00:00.000Z",
    );
  });

  it("throws on garbage", () => {
    expect(() => normalizeStartToUtcIso("not-a-date")).toThrow();
  });
});

describe("isWithinClinicHours", () => {
  it("accepts a 9:00 AM ET slot", () => {
    expect(isWithinClinicHours("2026-06-01T09:00:00-04:00")).toBe(true);
  });
  it("accepts the last 4:30 PM ET slot", () => {
    expect(isWithinClinicHours("2026-06-01T16:30:00-04:00")).toBe(true);
  });
  it("rejects a 5:00 PM ET slot (end is exclusive)", () => {
    expect(isWithinClinicHours("2026-06-01T17:00:00-04:00")).toBe(false);
  });
  it("rejects an 8:30 AM ET slot (before open)", () => {
    expect(isWithinClinicHours("2026-06-01T08:30:00-04:00")).toBe(false);
  });
  it("evaluates against clinic time, not the incoming offset", () => {
    // 14:00 UTC == 10:00 ET in June → inside hours.
    expect(isWithinClinicHours("2026-06-01T14:00:00Z")).toBe(true);
    // 02:00 UTC == 22:00 previous day ET → outside hours.
    expect(isWithinClinicHours("2026-06-01T02:00:00Z")).toBe(false);
  });
});

describe("clinicDateKey", () => {
  it("buckets a late-UTC instant into the correct clinic day", () => {
    // 01:00 UTC on June 2 is still 21:00 ET on June 1.
    expect(clinicDateKey("2026-06-02T01:00:00Z")).toBe("2026-06-01");
  });
});

describe("nextCalendarDay", () => {
  it("advances one day", () => {
    expect(nextCalendarDay("2026-06-01")).toBe("2026-06-02");
  });
  it("rolls over a month boundary", () => {
    expect(nextCalendarDay("2026-06-30")).toBe("2026-07-01");
  });
});

describe("relativeLabel / minutesUntil", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  it("reports minutes for near times", () => {
    expect(minutesUntil("2026-06-01T12:15:00Z", now)).toBe(15);
    expect(relativeLabel("2026-06-01T12:15:00Z", now)).toBe("In 15 mins");
  });
  it("keeps minute precision past the hour", () => {
    expect(relativeLabel("2026-06-01T13:09:00Z", now)).toBe("In 1 hr 9 min");
  });
  it("omits minutes on an exact hour", () => {
    expect(relativeLabel("2026-06-01T13:00:00Z", now)).toBe("In 1 hr");
    expect(relativeLabel("2026-06-01T14:00:00Z", now)).toBe("In 2 hrs");
  });
  it("shows 'In under a min' for the final minute", () => {
    expect(relativeLabel("2026-06-01T12:00:30Z", now)).toBe("In under a min");
  });
  it("shows 'Now' at the start instant", () => {
    expect(relativeLabel("2026-06-01T12:00:00Z", now)).toBe("Now");
  });
  it("handles past times", () => {
    expect(relativeLabel("2026-06-01T11:00:00Z", now)).toBe("In progress");
  });
});
