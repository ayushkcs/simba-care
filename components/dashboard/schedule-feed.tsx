"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { filterGroups } from "@/lib/filter-bookings";
import type { BookingDayGroup, TreatmentCategory } from "@/types";
import { DayGroup } from "./day-group";
import { FilterMenu } from "./filter-menu";
import { EmptyState } from "./empty-state";
import { PastEmptyState } from "./past-empty-state";
import { PastWindowExpander } from "./past-window-expander";

type StatusFilter = "all" | "confirmed" | "cancelled";
type TreatmentFilter = TreatmentCategory | "all";

const TREATMENT_LABELS: Record<TreatmentCategory, string> = {
  consultation: "Consultation",
  cleaning: "Cleaning",
  extraction: "Extraction",
  "root-canal": "Root Canal",
  filling: "Filling",
  whitening: "Whitening",
  checkup: "Check-up",
  other: "Other",
};

const TREATMENT_ORDER: TreatmentCategory[] = [
  "consultation",
  "cleaning",
  "checkup",
  "filling",
  "root-canal",
  "extraction",
  "whitening",
  "other",
];

export function ScheduleFeed({
  view,
  groups,
  nowMs,
  nextUid = null,
  connected = true,
  days = 0,
  nextDays = null,
  truncated = false,
}: {
  view: "upcoming" | "past";
  groups: BookingDayGroup[];
  nowMs: number;
  nextUid?: string | null;
  connected?: boolean;
  days?: number;
  nextDays?: number | null;
  truncated?: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [treatment, setTreatment] = useState<TreatmentFilter>("all");

  // Fixed instant from the server so the now-marker position is hydration-stable.
  const now = useMemo(() => new Date(nowMs), [nowMs]);

  // Only offer treatment options that actually appear in the current data.
  const treatmentOptions = useMemo(() => {
    const present = new Set<TreatmentCategory>();
    for (const g of groups)
      for (const b of g.bookings) present.add(b.treatmentCategory);
    return [
      { value: "all", label: "All treatments" },
      ...TREATMENT_ORDER.filter((c) => present.has(c)).map((c) => ({
        value: c,
        label: TREATMENT_LABELS[c],
      })),
    ];
  }, [groups]);

  const totalAll = useMemo(
    () => groups.reduce((n, g) => n + g.bookings.length, 0),
    [groups],
  );

  const filteredGroups = useMemo(
    () => filterGroups(groups, { q, status, treatment }),
    [groups, q, status, treatment],
  );

  const totalShown = useMemo(
    () => filteredGroups.reduce((n, g) => n + g.bookings.length, 0),
    [filteredGroups],
  );

  const hasFilters = q.trim() !== "" || status !== "all" || treatment !== "all";
  const clearAll = () => {
    setQ("");
    setStatus("all");
    setTreatment("all");
  };

  // Past view failed to load.
  if (view === "past" && !connected) {
    return (
      <p className="text-center text-sm text-rose-600">
        Couldn&apos;t load past appointments. Please try again.
      </p>
    );
  }

  // Nothing in the view at all → base empty state (filters would be pointless).
  if (totalAll === 0) {
    return (
      <div className="space-y-6">
        {view === "upcoming" ? (
          <EmptyState />
        ) : (
          <>
            <PastEmptyState days={days} />
            <PastWindowExpander days={days} nextDays={nextDays} truncated={truncated} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search + filter toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or phone…"
            aria-label="Search appointments"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-9 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FilterMenu
            value={status}
            onChange={(v) => setStatus(v as StatusFilter)}
            label="Filter by status"
            options={[
              { value: "all", label: "All statuses" },
              { value: "confirmed", label: "Confirmed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
          {treatmentOptions.length > 1 && (
            <FilterMenu
              value={treatment}
              onChange={(v) => setTreatment(v as TreatmentFilter)}
              label="Filter by treatment"
              align="end"
              options={treatmentOptions}
            />
          )}
        </div>
      </div>

      {/* Active filter chips + live result count */}
      <div className="flex flex-wrap items-center gap-2">
        {hasFilters && (
          <>
            {q.trim() && (
              <FilterChip label={`“${q.trim()}”`} onRemove={() => setQ("")} />
            )}
            {status !== "all" && (
              <FilterChip
                label={status === "confirmed" ? "Confirmed" : "Cancelled"}
                onRemove={() => setStatus("all")}
              />
            )}
            {treatment !== "all" && (
              <FilterChip
                label={TREATMENT_LABELS[treatment]}
                onRemove={() => setTreatment("all")}
              />
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-primary transition-colors hover:underline"
            >
              Clear all
            </button>
          </>
        )}
        <span className="ml-auto text-xs text-muted">
          {hasFilters ? `${totalShown} of ${totalAll}` : totalAll} Appointment
          {totalAll === 1 ? "" : "s"}
        </span>
      </div>

      {/* Results */}
      {totalShown === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted ring-1 ring-inset ring-line">
            <SlidersHorizontal className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold text-ink">No matching appointments</h2>
          <p className="max-w-sm text-sm text-muted">
            Nothing matches your search and filters. Try adjusting or clearing them.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
          >
            Clear filters
          </button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((g) => (
            <DayGroup
              key={g.dateKey}
              group={g}
              now={now}
              nextUid={nextUid}
              withNowMarker={view === "upcoming"}
            />
          ))}
        </div>
      )}

      {view === "past" && (
        <PastWindowExpander days={days} nextDays={nextDays} truncated={truncated} />
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink shadow-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
