"use client";
import { useEffect, useState } from "react";
import { useLocale } from "./i18n";

// Display-layer content overlay (Turkish). Data files stay English; this
// merges translations by stable id at render time, so seeded DB rows,
// search filters and done[] indexes keep working unchanged.
export type ContentOverlay = Record<string, Record<string, Record<string, any>>>;

let cache: Record<string, ContentOverlay | null> = {};
let loading: Record<string, Promise<unknown> | null> = {};
const EXP: Record<string, string> = {
  tr: "CONTENT_TR",
  es: "CONTENT_ES",
  zh: "CONTENT_ZH",
  ru: "CONTENT_RU",
  id: "CONTENT_ID",
  fil: "CONTENT_FIL",
};

export function useContentOverlay(): ContentOverlay {
  const { locale } = useLocale();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!EXP[locale]) return;
    if (cache[locale]) { setTick((x) => x + 1); return; }
    if (!loading[locale]) {
      loading[locale] = import(`./locales/content-${locale}`)
        .then((m) => { cache[locale] = (m[EXP[locale]] ?? {}) as ContentOverlay; })
        .catch(() => { cache[locale] = {}; });
    }
    loading[locale]!.then(() => setTick((x) => x + 1));
  }, [locale]);
  return EXP[locale] ? (cache[locale] ?? {}) : {};
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
