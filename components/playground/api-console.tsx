"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clipboard, Loader2, Send, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ActionKey = "check_availability" | "create_booking" | "cancel_booking";

interface Result {
  loading: boolean;
  httpStatus?: number;
  ms?: number;
  body?: Record<string, unknown> | null;
}

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: "check_availability", label: "Availability" },
  { key: "create_booking", label: "Create" },
  { key: "cancel_booking", label: "Cancel" },
];

const STATUS_META: Record<string, { variant: "emerald" | "amber" | "coral" | "rose" }> =
  {
    success: { variant: "emerald" },
    unavailable: { variant: "amber" },
    conflict: { variant: "coral" },
    error: { variant: "rose" },
  };

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/15";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function ApiConsole() {
  const [active, setActive] = useState<ActionKey>("check_availability");

  const [check, setCheck] = useState({ startDate: "", endDate: "" });
  const [create, setCreate] = useState({
    start: "",
    name: "Test Reviewer",
    email: "reviewer@example.com",
    number: "7782957462",
    notes: "Root Canal",
  });
  const [cancel, setCancel] = useState({
    bookingId: "",
    reason: "Patient requested cancellation",
  });

  const [results, setResults] = useState<Record<ActionKey, Result | undefined>>({
    check_availability: undefined,
    create_booking: undefined,
    cancel_booking: undefined,
  });
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Seed sensible near-future defaults on mount. Server renders empty inputs and
  // the client fills them after hydration, so there's no mismatch — this is the
  // intended "sync from a client-only value (the clock)" use of an effect.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() + 1);
    const end = new Date(now);
    end.setDate(now.getDate() + 6);
    setCheck({ startDate: ymd(start), endDate: ymd(end) });
    setCreate((c) => ({ ...c, start: `${ymd(start)}T10:00` }));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const body = useMemo(() => {
    if (active === "check_availability") {
      return {
        action: "check_availability",
        startDate: check.startDate,
        endDate: check.endDate,
      };
    }
    if (active === "create_booking") {
      return {
        action: "create_booking",
        start: create.start,
        name: create.name,
        email: create.email,
        number: create.number,
        ...(create.notes.trim() ? { notes: create.notes } : {}),
      };
    }
    return {
      action: "cancel_booking",
      bookingId: cancel.bookingId,
      ...(cancel.reason.trim() ? { reason: cancel.reason } : {}),
    };
  }, [active, check, create, cancel]);

  const result = results[active];

  async function send() {
    setHint(null);
    setResults((r) => ({ ...r, [active]: { loading: true } }));
    const t0 = performance.now();
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const ms = Math.round(performance.now() - t0);
      const json = await res.json().catch(() => ({
        status: "error",
        message: "Response was not valid JSON.",
      }));
      setResults((r) => ({
        ...r,
        [active]: { loading: false, httpStatus: res.status, ms, body: json },
      }));

      // Chain: a successful create pre-fills the cancel form + hints at the conflict path.
      if (
        active === "create_booking" &&
        json?.status === "success" &&
        json?.data?.bookingId
      ) {
        setCancel((c) => ({ ...c, bookingId: String(json.data.bookingId) }));
        setHint(
          "Booked! Send this same request again to trigger a double-booking conflict, or switch to Cancel (the booking ID is pre-filled).",
        );
      }
    } catch {
      setResults((r) => ({
        ...r,
        [active]: {
          loading: false,
          httpStatus: 0,
          ms: Math.round(performance.now() - t0),
          body: { status: "error", message: "Network error reaching /api/voice." },
        },
      }));
    }
  }

  function copyCurl() {
    const origin = window.location.origin;
    const curl = `curl -s -X POST ${origin}/api/voice \\\n  -H 'Content-Type: application/json' \\\n  -d '${JSON.stringify(body)}'`;
    navigator.clipboard?.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Slots returned by the last availability check → one-click into Create.
  const checkBody = results.check_availability?.body as
    | { data?: { slots?: string[]; alternativeSlots?: string[] } }
    | undefined;
  const slots = checkBody?.data?.slots ?? checkBody?.data?.alternativeSlots ?? [];

  function loadSlot(slot: string) {
    setCreate((c) => ({ ...c, start: slot.slice(0, 16) })); // naive clinic-local wall time
    setActive("create_booking");
    setHint(`Loaded slot ${slot} into Create. Send it to book.`);
  }

  // ── Edge-case presets ──────────────────────────────────────────────────────
  function preset(kind: "noavail" | "double" | "invalid" | "unknown") {
    const now = new Date();
    if (kind === "noavail") {
      const past = new Date(now);
      past.setMonth(now.getMonth() - 3);
      const past2 = new Date(past);
      past2.setDate(past.getDate() + 1);
      setCheck({ startDate: ymd(past), endDate: ymd(past2) });
      setActive("check_availability");
      setHint(
        'Past window → expect HTTP 200 with status "unavailable" + next-day alternatives.',
      );
    } else if (kind === "double") {
      setActive("create_booking");
      setHint(
        'Send Create once to book, then send again with the same time → status "conflict".',
      );
    } else if (kind === "invalid") {
      setCreate((c) => ({ ...c, email: "not-an-email" }));
      setActive("create_booking");
      setHint('Malformed email → expect HTTP 400 with status "error".');
    } else {
      setCancel((c) => ({ ...c, bookingId: "nonexistent-uid-123" }));
      setActive("cancel_booking");
      setHint('Unknown booking ID → expect HTTP 404 with status "error".');
    }
  }

  return (
    <div className="space-y-5">
      {/* Action tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-surface p-1 shadow-sm">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => {
                setActive(a.key);
                setHint(null);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active === a.key
                  ? "bg-primary text-primary-fg shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Edge-case presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-primary/70" aria-hidden />
            Edge cases:
          </span>
          {(
            [
              ["noavail", "No availability"],
              ["double", "Double booking"],
              ["invalid", "Invalid (400)"],
              ["unknown", "Unknown (404)"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              onClick={() => preset(kind)}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hint && (
        <p className="rounded-xl border border-primary/20 bg-accent-soft/60 px-3.5 py-2.5 text-xs text-accent">
          {hint}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Request card */}
        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold text-ink">Request</h2>

          {active === "check_availability" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="startDate">
                <input
                  type="date"
                  value={check.startDate}
                  onChange={(e) =>
                    setCheck((c) => ({ ...c, startDate: e.target.value }))
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="endDate">
                <input
                  type="date"
                  value={check.endDate}
                  onChange={(e) => setCheck((c) => ({ ...c, endDate: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          {active === "create_booking" && (
            <div className="space-y-3">
              <Field label="start (clinic-local, America/New_York)">
                <input
                  type="datetime-local"
                  value={create.start}
                  onChange={(e) => setCreate((c) => ({ ...c, start: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="name">
                  <input
                    value={create.name}
                    onChange={(e) => setCreate((c) => ({ ...c, name: e.target.value }))}
                    className={inputCls}
                  />
                </Field>
                <Field label="email">
                  <input
                    value={create.email}
                    onChange={(e) =>
                      setCreate((c) => ({ ...c, email: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="number">
                  <input
                    value={create.number}
                    onChange={(e) =>
                      setCreate((c) => ({ ...c, number: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="notes (treatment)">
                  <input
                    value={create.notes}
                    onChange={(e) =>
                      setCreate((c) => ({ ...c, notes: e.target.value }))
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>
          )}

          {active === "cancel_booking" && (
            <div className="space-y-3">
              <Field label="bookingId (uid or numeric id)">
                <input
                  value={cancel.bookingId}
                  onChange={(e) =>
                    setCancel((c) => ({ ...c, bookingId: e.target.value }))
                  }
                  placeholder="Run Create first to auto-fill this"
                  className={inputCls}
                />
              </Field>
              <Field label="reason">
                <input
                  value={cancel.reason}
                  onChange={(e) => setCancel((c) => ({ ...c, reason: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
          )}

          {/* Request body preview */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Request body</p>
            <pre className="overflow-x-auto rounded-lg border border-line bg-surface-2/60 p-3 font-mono text-xs leading-relaxed text-ink">
              {JSON.stringify(body, null, 2)}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={send}
              disabled={result?.loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-fg shadow-sm transition hover:brightness-105 disabled:opacity-60"
            >
              {result?.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              Send Request
            </button>
            <button
              type="button"
              onClick={copyCurl}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              ) : (
                <Clipboard className="h-4 w-4 text-muted" aria-hidden />
              )}
              {copied ? "Copied" : "Copy as curl"}
            </button>
          </div>
        </Card>

        {/* Response card */}
        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Response</h2>
            {result && !result.loading && (
              <div className="flex items-center gap-2">
                {typeof result.body?.status === "string" && (
                  <Badge
                    variant={
                      STATUS_META[result.body.status as string]?.variant ?? "neutral"
                    }
                  >
                    {String(result.body.status)}
                  </Badge>
                )}
                <span className="text-xs tabular-nums text-muted">
                  {result.httpStatus} · {result.ms}ms
                </span>
              </div>
            )}
          </div>

          {!result ? (
            <p className="py-10 text-center text-sm text-muted">
              Send a request to see the response.
            </p>
          ) : result.loading ? (
            <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Sending…
            </p>
          ) : (
            <pre className="max-h-80 overflow-auto rounded-lg border border-line bg-surface-2/60 p-3 font-mono text-xs leading-relaxed text-ink">
              {JSON.stringify(result.body, null, 2)}
            </pre>
          )}

          {/* Clickable slots from an availability check */}
          {active === "check_availability" && slots.length > 0 && (
            <div className="space-y-2 border-t border-line pt-3">
              <p className="text-xs font-medium text-muted">
                Click a slot to load it into Create:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {slots.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => loadSlot(s)}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft hover:text-accent"
                  >
                    {s.slice(11, 16)}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
