import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Code2,
  LayoutDashboard,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  TerminalSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToothLogo } from "@/components/dashboard/tooth-logo";
import { CLINIC_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "SIMBA Care — AI Dental Scheduling Assistant",
  description:
    "One API a voice agent calls to book against Cal.com, plus a live admin dashboard for the front desk.",
};

const REPO_URL = "https://github.com/ayushkcs/simba-care";

const PILLARS = [
  {
    Icon: PhoneCall,
    title: "One voice-agent API",
    body: "Check, book, and cancel from a single clean endpoint.",
  },
  {
    Icon: LayoutDashboard,
    title: "Live admin dashboard",
    body: "A real-time schedule for the front desk — search & filters.",
  },
  {
    Icon: ShieldCheck,
    title: "Every edge case handled",
    body: "No-availability, double-booking, timezones & cancellations.",
  },
];

const STEPS = [
  { Icon: PhoneCall, label: "AI Voice Agent", sub: "calls mid-conversation" },
  {
    Icon: ShieldCheck,
    label: "SIMBA Care",
    sub: "validate · normalize · map",
    highlight: true,
  },
  { Icon: CalendarCheck, label: "Cal.com", sub: "source of truth" },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col">
      {/* Top nav */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <Link
          href="/"
          aria-label="SIMBA Care home"
          className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
        >
          <ToothLogo />
          <span className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
            {CLINIC_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
          >
            <Code2 className="h-4 w-4 text-muted" aria-hidden />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-fg shadow-sm transition hover:brightness-105"
          >
            Dashboard
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
        <span className="simba-rise mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur-sm">
          <Stethoscope className="h-3.5 w-3.5 text-primary" aria-hidden />
          AI Dental Scheduling Assistant
        </span>

        {/* mascot with a soft warm glow */}
        <div className="simba-rise relative mb-6" style={{ animationDelay: "60ms" }}>
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--warm-2)] opacity-40 blur-3xl"
          />
          <ToothLogo size="lg" />
        </div>

        <h1
          className="simba-rise bg-gradient-to-br from-[#2b231c] via-[#7a3315] to-[#c2562e] bg-clip-text font-display text-5xl font-semibold tracking-tight text-transparent sm:text-6xl"
          style={{ animationDelay: "120ms" }}
        >
          {CLINIC_NAME}
        </h1>

        <p
          className="simba-rise mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          style={{ animationDelay: "180ms" }}
        >
          An AI voice agent answers the call and books the patient. SIMBA Care is the
          layer in between — <strong className="text-ink">one clean API</strong> it
          calls to schedule against <strong className="text-ink">Cal.com</strong>, plus
          a <strong className="text-ink">live dashboard</strong> for the front desk.
        </p>

        <div
          className="simba-rise mt-9 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c2562e] to-[#d96a34] px-5 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgba(194,86,46,0.8)] transition-all hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(194,86,46,0.9)]"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Open the Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
          >
            <TerminalSquare className="h-4 w-4 text-muted" aria-hidden />
            Try the API Console
          </Link>
        </div>

        {/* the actual contract — what makes it concrete */}
        <div
          className="simba-rise mt-12 w-full max-w-xl"
          style={{ animationDelay: "320ms" }}
        >
          <div className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_1px_2px_rgba(34,31,51,0.04),0_24px_48px_-24px_rgba(34,31,51,0.22)]">
            <div className="flex items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--warm-1)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--warm-2)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--warm-3)]" />
              </span>
              <span className="ml-1 font-mono text-xs text-muted">POST /api/voice</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-ink sm:text-xs">
              <code>
                <span className="text-muted">{`// the voice agent asks…`}</span>
                {"\n"}
                {`{ "action": "check_availability", "startDate": "2026-06-01" }`}
                {"\n\n"}
                <span className="text-muted">{`// …and gets a clean, branchable answer`}</span>
                {"\n"}
                {`{ "status": `}
                <span className="font-semibold text-emerald-600">{`"success"`}</span>
                {`, "data": { "slots": [`}
                {"\n"}
                {`    "2026-06-01T09:00:00`}
                <span className="text-accent">-04:00</span>
                {`", `}
                <span className="text-muted">{`// Eastern — EDT-aware`}</span>
                {"\n"}
                {`    "2026-06-01T09:30:00`}
                <span className="text-accent">-04:00</span>
                {`"`}
                {"\n"}
                {`] } }`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* How it works — a connected line stepper */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-14 pt-10 sm:px-6">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-wide text-muted">
          How it works
        </p>

        <div className="relative">
          {/* horizontal connector (desktop) */}
          <span
            aria-hidden
            className="absolute left-[16.666%] right-[16.666%] top-7 hidden h-px bg-gradient-to-r from-line/0 via-line to-line/0 sm:block"
          />
          {/* continuous vertical connector (mobile) */}
          <span
            aria-hidden
            className="absolute bottom-7 left-7 top-7 w-px bg-line sm:hidden"
          />
          <ol className="flex flex-col gap-7 sm:flex-row sm:gap-0">
            {STEPS.map((s) => (
              <li
                key={s.label}
                className="relative flex items-center gap-4 sm:flex-1 sm:flex-col sm:gap-0 sm:text-center"
              >
                <span
                  className={
                    "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface ring-1 ring-inset " +
                    (s.highlight
                      ? "text-accent ring-accent/30 shadow-[0_0_0_5px_var(--accent-soft)]"
                      : "text-muted ring-line shadow-sm")
                  }
                >
                  <s.Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="sm:mt-4">
                  <p className="text-sm font-semibold text-ink">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          No database of its own — Cal.com holds every booking.
        </p>
      </section>

      {/* Features — one cohesive panel, divided into columns */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-8 pt-2 sm:px-6">
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {PILLARS.map(({ Icon, title, body }, i) => (
              <div
                key={title}
                className="p-6 transition-colors hover:bg-surface-2/40 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-accent/20">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs font-medium text-muted/50">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="mt-5 text-base font-semibold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted sm:flex-row">
          <p>
            Built with <span className="font-medium text-ink">Next.js</span> ·{" "}
            <span className="font-medium text-ink">TypeScript</span> ·{" "}
            <span className="font-medium text-ink">Cal.com</span>
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
          >
            <Code2 className="h-4 w-4" aria-hidden />
            View source
          </a>
        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Built by{" "}
          <a
            href="https://ayushk.blog"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            Ayush
          </a>
        </p>
      </footer>
    </main>
  );
}
