"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import { GASES, searchGases } from "@/lib/gas-data";

export default function GasBooklet() {
  const { t } = useLocale();
  const o = useContentOverlay();
  const [q, setQ] = useState("");
  const results = useMemo(() => searchGases(q), [q]);
  const ovResults = results.map((g) => withOv(g, cov(o, "gas", g.slug)));

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("gas.title")}</h1>
        <p className="text-sm text-slate-600">
          {t("gas.sub1")} {t("gas.sub2").replace("{n}", String(GASES.length))}
          {t("gas.sub3")}
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("gas.searchPh")}
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label={t("gas.searchAria")}
      />
      <p className="text-xs text-slate-500">{t("gas.count").replace("{n}", String(results.length))}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {ovResults.map((gas) => (
          <Link key={gas.slug} href={`/gas/${gas.slug}`} className="rounded-2xl border bg-white p-3 hover:border-slate-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{gas.name}</h2>
              {gas.toxic && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">☠</span>}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              UN {gas.un} · bp {gas.boiling} · {gas.flammability}
            </p>
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-slate-500">{t("gas.noMatch")}</p>
      )}
    </div>
  );
}
