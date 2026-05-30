"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keeps the read-only dashboard "live" by re-running the server component on an
 * interval (default 60s). No websockets needed — router.refresh() re-fetches
 * the Cal.com data and re-renders without a full page reload.
 */
export function AutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
