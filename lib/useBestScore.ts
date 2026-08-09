"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persists a personal best in localStorage.
 * `mode` decides whether a higher or lower value wins — 2048 and Snake want
 * the highest score, Memory wants the fewest moves.
 */
export function useBestScore(key: string, mode: "high" | "low" = "high") {
  const storageKey = `hk:best:${key}`;
  const [best, setBest] = useState<number | null>(null);

  // Read after mount so server and client markup match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n)) setBest(n);
      }
    } catch {
      // localStorage can be unavailable (private mode, blocked cookies).
    }
  }, [storageKey]);

  const submit = useCallback(
    (value: number) => {
      setBest((prev) => {
        const isBetter =
          prev === null || (mode === "high" ? value > prev : value < prev);
        if (!isBetter) return prev;
        try {
          localStorage.setItem(storageKey, String(value));
        } catch {
          // Ignore write failures; the in-memory best still updates.
        }
        return value;
      });
    },
    [storageKey, mode]
  );

  return { best, submit };
}
