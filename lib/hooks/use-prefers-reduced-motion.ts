"use client";

import { useEffect, useState } from "react";

/**
 * Единый хук prefers-reduced-motion на весь проект.
 * null — пока matchMedia не проверен (SSR/первый кадр): компоненты могут
 * не мигать анимациями до выяснения настройки, а затем переключиться.
 */
export function usePrefersReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
