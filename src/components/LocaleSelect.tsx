"use client";
import { LOCALES, useLocale } from "@/lib/i18n";

export default function LocaleSelect() {
  const { locale, setLocale } = useLocale();
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      aria-label="Language"
      title="Language"
      className="rounded-full border border-amber-200 bg-white px-2 py-1.5 text-xs font-bold text-stone-700 dark:border-red-900 dark:bg-black dark:text-red-300"
    >
      {LOCALES.map((l) => (
        <option key={l.id} value={l.id}>{l.label}</option>
      ))}
    </select>
  );
}
