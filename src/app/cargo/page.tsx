"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import { CARGOES, CARGO_CATEGORIES, cargoTags, searchCargoes } from "@/lib/cargo-data";

export default function CargoBooklet() {
  useDocTitle("cargo.title");
  const { t } = useLocale();
  const o = useContentOverlay();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const results = useMemo(() => {
    const found = searchCargoes(q);
    return cat === "All" ? found : found.filter((c) => c.category === cat);
  }, [q, cat]);
  const ovResults = results.map((c) => withOv(c, cov(o, "cargo", c.slug)));
  const pick = (p: unknown, fb: string): string => {
    if (typeof p === "string") return p;
    const r = (p ?? {}) as Record<string, unknown>;
    const v = r.value ?? r.name ?? r.title ?? fb;
    return typeof v === "string" && v ? v : fb;
  };
  const catLabel = (c: string, i: number) => pick(cov(o, "cargoCats", i), c);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("cargo.title")}</h1>
        <p className="text-sm text-slate-600">
          {t("cargo.sub1")} {t("cargo.sub2").replace("{n}", String(CARGOES.length))}
          {t("cargo.sub3")}
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("cargo.searchPh")}
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label={t("cargo.searchAria")}
      />
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCat("All")}
          className={`rounded-full px-3 py-1 text-xs font-bold ${cat === "All" ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}
        >
          {t("common.all")}
        </button>
        {CARGO_CATEGORIES.map((c, i) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${cat === c ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}
          >
            {catLabel(c, i)}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{t("cargo.count").replace("{n}", String(results.length))}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {ovResults.map((c) => (
          <Link key={c.slug} href={`/cargo/${c.slug}`} className="rounded-2xl border bg-white p-3 hover:border-slate-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{c.name}</h2>
              <span className="flex shrink-0 gap-1">
                {cargoTags(c).map((tag) => (
                  <span key={tag.label} title={tag.label} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    tag.tone === "red" ? "bg-red-100 text-red-700" :
                    tag.tone === "amber" ? "bg-amber-100 text-amber-800" :
                    tag.tone === "yellow" ? "bg-yellow-100 text-yellow-800" :
                    tag.tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-700"}`}>{tag.icon}</span>
                ))}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              UN {c.un} · {c.category} · fp {c.flash}
            </p>
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-slate-500">{t("cargo.noMatch")}</p>
      )}
    </div>
  );
}
