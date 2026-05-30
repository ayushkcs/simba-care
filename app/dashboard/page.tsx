import { CalendarDays, CalendarRange } from "lucide-react";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FeedTabs } from "@/components/dashboard/feed-tabs";
import { Meter, SplitBar } from "@/components/dashboard/meter";
import { NextPatientCard } from "@/components/dashboard/next-patient-card";
import { ScheduleFeed } from "@/components/dashboard/schedule-feed";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDashboardData, getPastBookings } from "@/lib/cal/dashboard";
import { DAILY_SLOT_CAPACITY, PAST_WINDOWS } from "@/lib/constants";

// Always fetch fresh booking data on each request — never serve stale schedule.
export const dynamic = "force-dynamic";

/** Clamp the `days` query param to one of the allowed past windows. */
function parseDays(raw?: string): number {
  const n = Number(raw);
  return (PAST_WINDOWS as readonly number[]).includes(n) ? n : PAST_WINDOWS[0];
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; days?: string }>;
}) {
  const sp = await searchParams;
  const view = sp.view === "past" ? "past" : "upcoming";
  const days = parseDays(sp.days);
  const nextDays = PAST_WINDOWS.find((w) => w > days) ?? null;

  // Stats stay a forward-looking snapshot regardless of which feed is shown;
  // past history is only fetched when the Past tab is active.
  const [data, past] = await Promise.all([
    getDashboardData(),
    view === "past" ? getPastBookings({ days }) : Promise.resolve(null),
  ]);

  const { connected, groups, stats, nextPatient, nowMs } = data;

  return (
    <div className="min-h-full">
      <AutoRefresh />
      <DashboardHeader connected={connected} />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        {/* Summary metrics strip — always the upcoming snapshot */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Today's Visits"
            value={stats.todayCount}
            Icon={CalendarDays}
            accent="primary"
          >
            <Meter
              value={stats.todayCount}
              max={DAILY_SLOT_CAPACITY}
              caption={`${stats.todayCount} of ${DAILY_SLOT_CAPACITY} slots booked`}
            />
          </StatCard>
          <StatCard
            label="Upcoming Bookings"
            value={stats.totalUpcoming}
            Icon={CalendarRange}
            accent="neutral"
          >
            <SplitBar
              confirmed={stats.totalUpcoming}
              cancelled={stats.cancelledCount}
            />
          </StatCard>
          <NextPatientCard patient={nextPatient} />
        </section>

        {/* Schedule feed — Upcoming / Past tabs + search & filters */}
        <section className="space-y-6">
          <FeedTabs view={view} />
          <ScheduleFeed
            view={view}
            nowMs={nowMs}
            groups={view === "upcoming" ? groups : (past?.groups ?? [])}
            nextUid={view === "upcoming" ? nextPatient?.uid : null}
            connected={view === "upcoming" ? connected : (past?.connected ?? false)}
            days={days}
            nextDays={nextDays}
            truncated={past?.truncated ?? false}
          />
        </section>

        {!connected && (
          <p className="text-center text-sm text-rose-600">
            Couldn&apos;t reach Cal.com. Showing no data — retrying automatically.
          </p>
        )}
      </main>
    </div>
  );
}
