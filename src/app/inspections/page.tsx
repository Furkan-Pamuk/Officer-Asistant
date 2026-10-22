"use client";
import Link from "next/link";
import { INSPECTION_TYPES, SEED_CARDS } from "@/lib/data";
import { useLocale } from "@/lib/i18n";

export default function Inspections() {
  const { t } = useLocale();
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t("insp.pick")}</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {INSPECTION_TYPES.map((it) => (
          <div key={it.id} className="rounded-2xl border bg-white p-4">
            <div className="text-xs font-bold text-sky-700">{it.short}</div>
            <h2 className="font-semibold">{it.name}</h2>
            <p className="text-sm text-slate-600">{it.description}</p>
            <p className="mt-1 text-xs text-slate-500">{t("insp.source")} <a className="underline" href={it.sourceUrl} target="_blank" rel="noreferrer">{it.source}</a></p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{t("insp.cards").replace("{n}", String(SEED_CARDS.filter((c) => c.inspection === it.id).length))}</span>
              <Link href={`/inspections/${it.id}`} className="rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white">{t("insp.open")}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
