import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { ApiConsole } from "@/components/playground/api-console";
import { ToothLogo } from "@/components/dashboard/tooth-logo";

export const metadata: Metadata = {
  title: "API Console · SIMBA Care",
  description:
    "Interactive console for the SIMBA Care voice endpoint — exercise every action and edge case in the browser.",
};

export default function PlaygroundPage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ToothLogo />
            <div className="leading-tight">
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                API Console
              </h1>
              <p className="text-xs text-muted">
                Test the voice endpoint · POST /api/voice
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-2"
          >
            <ArrowLeft className="h-4 w-4 text-muted" aria-hidden />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* Live-key warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            This console calls the <strong>live Cal.com API</strong>. “Create” and
            “Cancel” make <strong>real bookings</strong> in the connected account —
            they’ll appear on the{" "}
            <Link href="/dashboard" className="font-medium underline">
              dashboard
            </Link>
            .
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          Pick an action, tweak the pre-filled example, and send it to the single{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs text-ink">
            POST /api/voice
          </code>{" "}
          endpoint — exactly what a voice agent would call mid-conversation. Use the
          edge-case presets to verify no-availability, double-booking, validation, and
          unknown-booking handling.
        </p>

        <ApiConsole />
      </main>
    </div>
  );
}
