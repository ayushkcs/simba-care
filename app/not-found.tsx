"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";

/** Deterministic decor so SSR and client markup match (no Math.random). */
const PARTICLES = [
  { left: "12%", top: "22%", size: 18, delay: "0s", kind: "sparkle" },
  { left: "82%", top: "18%", size: 14, delay: "1.2s", kind: "plus" },
  { left: "20%", top: "70%", size: 12, delay: "2.1s", kind: "plus" },
  { left: "76%", top: "66%", size: 20, delay: "0.6s", kind: "sparkle" },
  { left: "50%", top: "12%", size: 12, delay: "1.8s", kind: "dot" },
  { left: "8%", top: "48%", size: 10, delay: "2.6s", kind: "dot" },
  { left: "90%", top: "44%", size: 16, delay: "0.3s", kind: "sparkle" },
  { left: "38%", top: "82%", size: 12, delay: "1.5s", kind: "plus" },
] as const;

export default function NotFound() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--px", `${x * 14}px`);
      el.style.setProperty("--py", `${y * 14}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* drifting decor */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="simba-drift absolute text-primary/55"
            style={{ left: p.left, top: p.top, animationDelay: p.delay }}
          >
            {p.kind === "sparkle" ? (
              <Sparkles
                className="simba-twinkle"
                style={{ width: p.size, height: p.size }}
              />
            ) : p.kind === "plus" ? (
              <Plus
                className="simba-twinkle text-[#d0892e]/70"
                style={{ width: p.size, height: p.size }}
              />
            ) : (
              <span
                className="block rounded-full bg-[#ffc98a]"
                style={{ width: p.size / 2, height: p.size / 2 }}
              />
            )}
          </span>
        ))}
      </div>

      <div
        ref={parallaxRef}
        className="relative flex flex-col items-center"
        style={{
          transform: "translate(var(--px,0), var(--py,0))",
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* status pill */}
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Error 404 · Page not found
        </span>

        {/* 4 [tooth] 4 */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <Digit>4</Digit>
          <ToothMascot />
          <Digit>4</Digit>
        </div>

        <h1 className="mt-10 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          This page skipped its appointment.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          We looked everywhere — the chart, the waiting room, even under the chair — but
          couldn&apos;t find what you were after. It may have been cancelled,
          rescheduled, or never booked at all.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c2562e] to-[#d96a34] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-10px_rgba(194,86,46,0.8)] transition-all hover:brightness-105 hover:shadow-[0_10px_30px_-10px_rgba(194,86,46,0.9)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to the schedule
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
          >
            SIMBA Care home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Digit({ children }: { children: React.ReactNode }) {
  return (
    <span className="simba-shimmer-text font-display bg-gradient-to-r from-[#c2562e] via-[#e07a3c] to-[#ca9a2e] bg-clip-text text-[6.5rem] font-bold leading-none tracking-tighter text-transparent drop-shadow-[0_6px_30px_rgba(194,86,46,0.25)] sm:text-[10rem]">
      {children}
    </span>
  );
}

/** A glossy tooth with a confused little face — the "0" of 404. */
function ToothMascot() {
  return (
    <div className="relative flex w-24 items-center justify-center sm:w-36">
      {/* pulsing halo */}
      <div
        aria-hidden
        className="simba-halo absolute h-28 w-28 rounded-full bg-[#ffb399]/40 blur-2xl sm:h-44 sm:w-44"
      />
      <svg
        viewBox="0 0 120 144"
        className="simba-float relative w-full drop-shadow-[0_12px_24px_rgba(34,31,51,0.18)]"
        role="img"
        aria-label="A confused cartoon tooth that has lost its way"
      >
        <defs>
          <linearGradient id="toothBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#fdf6ec" />
            <stop offset="100%" stopColor="#f3e6d2" />
          </linearGradient>
        </defs>

        <path
          d="M60 10 C36 10 20 25 20 52 C20 76 26 90 33 110 C37 123 47 132 53 122 C58 114 57 101 60 101 C63 101 62 114 67 122 C73 132 83 123 87 110 C94 90 100 76 100 52 C100 25 84 10 60 10 Z"
          fill="url(#toothBody)"
          stroke="#e7d3b6"
          strokeWidth="1.5"
        />
        {/* gloss highlight */}
        <ellipse cx="44" cy="38" rx="11" ry="16" fill="#ffffff" opacity="0.8" />

        {/* eyebrows (confused — one raised) */}
        <path
          d="M40 50 q7 -6 15 -2"
          stroke="#5b463a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M66 46 q8 -3 15 3"
          stroke="#5b463a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* eyes */}
        <circle cx="48" cy="62" r="4.5" fill="#3a2c22" />
        <circle cx="74" cy="62" r="4.5" fill="#3a2c22" />
        <circle cx="49.5" cy="60.5" r="1.4" fill="#ffffff" />
        <circle cx="75.5" cy="60.5" r="1.4" fill="#ffffff" />

        {/* confused little mouth */}
        <ellipse cx="60" cy="82" rx="5" ry="6" fill="#5b463a" />

        {/* sweat drop */}
        <path
          d="M90 64 c0 5 -4 8 -4 12 a4 4 0 0 0 8 0 c0 -4 -4 -7 -4 -12 Z"
          fill="#7dd3fc"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}
