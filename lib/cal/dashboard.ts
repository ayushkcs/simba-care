import "server-only";
import { subDays } from "date-fns";
import { PAST_TAKE } from "@/lib/constants";
import { clinicDateKey, todayClinicDateKey } from "@/lib/time";
import type { BookingDayGroup, BookingView } from "@/types";
import { listBookings } from "./client";
import { groupBookingsByDay } from "./transforms";
import type { CalBooking } from "./types";

export interface DashboardData {
  connected: boolean;
  groups: BookingDayGroup[];
  stats: {
    todayCount: number;
    totalUpcoming: number;
    cancelledCount: number;
  };
  nextPatient: BookingView | null;
  nowMs: number;
}

export async function getDashboardData(now: Date = new Date()): Promise<DashboardData> {
  const [upcomingRes, cancelledRes] = await Promise.all([
    listBookings({ status: "upcoming" }),
    listBookings({ status: "cancelled", take: 50 }),
  ]);

  if (!upcomingRes.ok) {
    return {
      connected: false,
      groups: [],
      stats: { todayCount: 0, totalUpcoming: 0, cancelledCount: 0 },
      nextPatient: null,
      nowMs: now.getTime(),
    };
  }

  const today = todayClinicDateKey(now);
  const seen = new Set<number>();
  const merged: CalBooking[] = [];

  for (const b of upcomingRes.data.data) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      merged.push(b);
    }
  }
  if (cancelledRes.ok) {
    for (const b of cancelledRes.data.data) {
      if (seen.has(b.id)) continue;
      if (clinicDateKey(b.start) >= today) {
        seen.add(b.id);
        merged.push(b);
      }
    }
  }

  const groups = groupBookingsByDay(merged, now);
  const allViews = groups.flatMap((g) => g.bookings);
  const confirmed = allViews.filter((v) => v.status === "confirmed");

  const nextPatient =
    confirmed
      .filter((v) => new Date(v.start).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] ??
    null;

  return {
    connected: true,
    groups,
    stats: {
      todayCount: confirmed.filter((v) => clinicDateKey(v.start) === today).length,
      totalUpcoming: confirmed.length,
      cancelledCount: allViews.filter((v) => v.status === "cancelled").length,
    },
    nextPatient,
    nowMs: now.getTime(),
  };
}

export interface PastBookingsData {
  connected: boolean;
  groups: BookingDayGroup[];
  total: number;
  days: number;
  truncated: boolean;
}

export async function getPastBookings({
  days,
  now = new Date(),
}: {
  days: number;
  now?: Date;
}): Promise<PastBookingsData> {
  const windowStart = subDays(now, days);
  const afterStart = windowStart.toISOString();
  const beforeStart = now.toISOString();

  const [pastRes, cancelledRes] = await Promise.all([
    listBookings({ status: "past", afterStart, sortStart: "desc", take: PAST_TAKE }),
    listBookings({
      status: "cancelled",
      afterStart,
      beforeStart,
      sortStart: "desc",
      take: PAST_TAKE,
    }),
  ]);

  if (!pastRes.ok) {
    return { connected: false, groups: [], total: 0, days, truncated: false };
  }

  const startMs = windowStart.getTime();
  const nowMs = now.getTime();
  const seen = new Set<number>();
  const merged: CalBooking[] = [];

  const consider = (list: CalBooking[]) => {
    for (const b of list) {
      if (seen.has(b.id)) continue;
      const t = new Date(b.start).getTime();
      if (t >= startMs && t < nowMs) {
        seen.add(b.id);
        merged.push(b);
      }
    }
  };
  consider(pastRes.data.data);
  if (cancelledRes.ok) consider(cancelledRes.data.data);

  const truncated =
    pastRes.data.data.length >= PAST_TAKE ||
    (cancelledRes.ok && cancelledRes.data.data.length >= PAST_TAKE);

  return {
    connected: true,
    groups: groupBookingsByDay(merged, now, "desc"),
    total: merged.length,
    days,
    truncated,
  };
}
