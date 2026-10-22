"use client";
import { LOCALES, useLocale } from "@/lib/i18n";

export default function LocaleSelect() {
  const { locale, setLocale } = useLocale();
  const cur = LOCALES.find((l) => l.id === locale);
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as typeof locale)}
      aria-label="Language"
      title={cur?.label ?? "Language"}
      className="max-w-[92px] rounded-full border border-amber-200 bg-white px-1 py-1 text-[11px] font-bold text-stone-700 dark:border-red-900 dark:bg-black dark:text-red-300"
    >
      {LOCALES.map((l) => (
        <option key={l.id} value={l.id}>{l.flag} {l.code}</option>
      ))}
    </select>
  );
}
