"use client";
import { useEffect, useRef, useState } from "react";
import { LOCALES, useLocale, type Locale } from "@/lib/i18n";
import CountryFlag from "./CountryFlag";

export default function LocaleSelect() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const cur = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language selector"
        title={cur.label}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-2 py-1 text-[11px] font-bold text-stone-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-red-900 dark:bg-black dark:text-red-300 dark:hover:bg-red-950/60 dark:focus:ring-red-700"
      >
        <CountryFlag code={cur.id} className="h-3 w-4.5" />
        <span>{cur.code}</span>
        <svg
          className={`h-2.5 w-2.5 opacity-60 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 3.75L5 6.25L7.5 3.75" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[150px] rounded-2xl border border-amber-200 bg-white p-1.5 shadow-xl dark:border-red-900 dark:bg-neutral-950"
        >
          {LOCALES.map((l) => {
            const isSelected = l.id === locale;
            return (
              <button
                key={l.id}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  setLocale(l.id as Locale);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white"
                    : "text-stone-700 hover:bg-amber-50 dark:text-red-300/80 dark:hover:bg-red-950/50"
                }`}
              >
                <CountryFlag code={l.id} className="h-3 w-4.5" />
                <span className="font-bold">{l.code}</span>
                <span className="ml-auto text-[10px] font-normal opacity-60">{l.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
