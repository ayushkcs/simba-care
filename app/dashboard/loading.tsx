import { ToothLogo } from "@/components/dashboard/tooth-logo";

/** Streaming skeleton shown while the server fetches bookings from Cal.com. */
export default function DashboardLoading() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ToothLogo />
            <div className="h-4 w-28 rounded bg-line" />
          </div>
          <div className="h-6 w-36 rounded-full bg-line" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl animate-pulse space-y-8 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-line bg-surface" />
          ))}
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      </main>
    </div>
  );
}
