import { CLINIC_NAME } from "@/lib/constants";
import { ClinicClock } from "./clinic-clock";
import { SyncBadge } from "./sync-badge";
import { ToothLogo } from "./tooth-logo";

export function DashboardHeader({ connected }: { connected: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <ToothLogo />
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-ink">
            {CLINIC_NAME}
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ClinicClock />
          <SyncBadge connected={connected} />
        </div>
      </div>
    </header>
  );
}
