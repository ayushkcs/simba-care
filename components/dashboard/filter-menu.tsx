"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterMenu({
  value,
  options,
  onChange,
  label,
  align = "start",
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  /** Accessible name describing what this filters. */
  label: string;
  /** Which edge the panel aligns to (use "end" for right-most controls). */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);

    // Land focus on the selected option when the menu opens.
    const selected = panelRef.current?.querySelector<HTMLButtonElement>(
      '[aria-selected="true"]',
    );
    (selected ?? panelRef.current?.querySelector("button"))?.focus();

    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border bg-surface py-2.5 pl-3.5 pr-3 text-sm font-medium text-ink shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary/20",
          open
            ? "border-primary/40 ring-2 ring-primary/15"
            : "border-line hover:bg-surface-2",
        )}
      >
        <span className="whitespace-nowrap">{current.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label={label}
          className={cn(
            // Sized to its widest option, but never narrower than the trigger —
            // so it stays tight and adapts across screen sizes.
            "absolute z-20 mt-2 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-[0_12px_32px_-12px_rgba(34,31,51,0.28)]",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:bg-surface-2",
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-ink hover:bg-surface-2",
                )}
              >
                {opt.label}
                {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
