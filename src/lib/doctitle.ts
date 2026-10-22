"use client";
import { useEffect } from "react";
import { useLocale } from "./i18n";

// Per-page titles for client pages (root layout only sets the default).
// Usage: useDocTitle("route.title") — sets `Title • Shark` + meta description.
export function useDocTitle(titleKey: string, descKey?: string) {
  const { t, locale } = useLocale();
  useEffect(() => {
    document.title = `${t(titleKey)} • Shark`;
    if (descKey) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", t(descKey));
    }
  }, [t, locale, titleKey, descKey]);
}
