import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "upcoming", label: "Upcoming", href: "/dashboard" },
  { key: "past", label: "Past", href: "/dashboard?view=past" },
] as const;

export function FeedTabs({ view }: { view: "upcoming" | "past" }) {
  return (
    <div
      role="tablist"
      className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-sm"
    >
      {TABS.map((t) => {
        const active = t.key === view;
        return (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-fg shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
