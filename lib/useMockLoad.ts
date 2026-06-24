"use client";

import { useEffect, useState } from "react";

// Simulates a short data fetch so skeleton states are real and visible.
// Swap for actual data-loading state once the backend (spec §8) is wired.
export function useMockLoad(ms = 650): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
