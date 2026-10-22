"use client";
import { useEffect, useState } from "react";
import { useLocale } from "./i18n";

// Display-layer content overlay (Turkish). Data files stay English; this
// merges translations by stable id at render time, so seeded DB rows,
// search filters and done[] indexes keep working unchanged.
export type ContentOverlay = Record<string, Record<string, Record<string, any>>>;

let cache: ContentOverlay | null = null;
let loading: Promise<unknown> | null = null;

export function useContentOverlay(): ContentOverlay {
  const { locale } = useLocale();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (locale !== "tr") return;
    if (cache) { setTick((x) => x + 1); return; }
    if (!loading) {
      loading = import("./locales/content-tr")
        .then((m) => { cache = (m.CONTENT_TR ?? {}) as ContentOverlay; })
        .catch(() => { cache = {}; });
    }
    loading.then(() => setTick((x) => x + 1));
  }, [locale]);
  return locale === "tr" ? (cache ?? {}) : {};
}

// Overlay patch for one record, or {} when untranslated/another locale.
export function cov(o: ContentOverlay, mod: string, id: string | number): Record<string, any> {
  return o?.[mod]?.[String(id)] ?? {};
}

// Merge overlay into a base record (shallow spread; arrays replaced wholesale
// in source order so done[]/index alignment is preserved).
export function withOv<T extends object>(base: T, patch: Record<string, any> | undefined): T {
  if (!patch || Object.keys(patch).length === 0) return base;
  return { ...base, ...patch };
}
