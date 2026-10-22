"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { UI_EN } from "./locales/ui-en";
import { UI_TR } from "./locales/ui-tr";

export type Locale = "en" | "tr" | "es" | "zh" | "ru" | "fil" | "id";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "tr", label: "Türkçe" },
  { id: "es", label: "Español" },
  { id: "zh", label: "中文" },
  { id: "ru", label: "Русский" },
  { id: "fil", label: "Filipino" },
  { id: "id", label: "Bahasa Indonesia" },
];

const KEY = "oa-locale";
// English + Turkish ship in the main bundle; the rest lazy-load on demand.
const STATIC_DICTS: Record<string, Record<string, string>> = { en: UI_EN, tr: UI_TR };
const dictCache: Record<string, Record<string, string>> = { en: UI_EN, tr: UI_TR };
const EXP: Record<string, string> = { es: "UI_ES", zh: "UI_ZH", ru: "UI_RU", fil: "UI_FIL", id: "UI_ID" };

interface I18nCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx>({ locale: "en", setLocale: () => {}, t: (k) => UI_EN[k] ?? k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [, setTick] = useState(0);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v && STATIC_DICTS[v]) setLocaleState(v as Locale);
      else if (v && EXP[v]) {
        const loc = v as Locale;
        setLocaleState(loc);
        import(`./locales/ui-${loc}`).then((m) => {
          dictCache[loc] = m[EXP[loc]] ?? {};
          setTick((x) => x + 1);
        }).catch(() => {});
      }
    } catch { /* ignore */ }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
    try { document.documentElement.lang = l === "zh" ? "zh-CN" : l; } catch { /* ignore */ }
    if (!dictCache[l] && EXP[l]) {
      import(`./locales/ui-${l}`).then((m) => {
        dictCache[l] = m[EXP[l]] ?? {};
        setTick((x) => x + 1);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    try { document.documentElement.lang = locale === "zh" ? "zh-CN" : locale; } catch { /* ignore */ }
  }, [locale]);

  const t = useCallback((key: string): string => {
    return dictCache[locale]?.[key] ?? UI_EN[key] ?? key;
  }, [locale]);

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLocale(): I18nCtx {
  return useContext(Ctx);
}
