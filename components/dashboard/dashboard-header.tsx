import Link from "next/link";
import { CLINIC_NAME } from "@/lib/constants";
import { ClinicClock } from "./clinic-clock";
import { SyncBadge } from "./sync-badge";
import { ToothLogo } from "./tooth-logo";

export function DashboardHeader({ connected }: { connected: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="SIMBA Care home"
          className="flex min-w-0 items-center gap-3 rounded-xl transition-opacity hover:opacity-80"
        >
          <ToothLogo />
          <h1 className="truncate text-lg font-semibold leading-tight tracking-tight text-ink">
            {CLINIC_NAME}
          </h1>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ClinicClock />
          <SyncBadge connected={connected} />
        </div>
      </div>
    </header>
  );
}
