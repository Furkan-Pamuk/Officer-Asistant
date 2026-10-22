"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import { BULKS, searchBulks } from "@/lib/imsbc-data";

const GROUPS = ["All", "A", "B", "C"] as const;
const GROUP_TONE: Record<string, string> = {
  A: "bg-red-100 text-red-700",
  B: "bg-amber-100 text-amber-800",
  C: "bg-teal-100 text-teal-800",
};

export default function BulkBooklet() {
  const { t } = useLocale();
  const o = useContentOverlay();
  const [q, setQ] = useState("");
  const [g, setG] = useState<string>("All");
  const results = useMemo(() => {
    const found = searchBulks(q);
    return g === "All" ? found : found.filter((b) => b.group === g || (g === "A" && b.group === "A and B") || (g === "B" && b.group === "A and B"));
  }, [q, g]);
  const ovResults = results.map((b) => withOv(b, cov(o, "bulk", b.slug)));

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("bulk.title")}</h1>
        <p className="text-sm text-slate-600">
          {t("bulk.sub1")} {t("bulk.sub2").replace("{n}", String(BULKS.length))}
          {t("bulk.sub3")}
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("bulk.searchPh")}
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label={t("bulk.searchAria")}
      />
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((c) => (
          <button
            key={c}
            onClick={() => setG(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${g === c ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}
          >
            {c === "All" ? t("bulk.allGroups") : t("bulk.groupN").replace("{g}", c)}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{t("bulk.count").replace("{n}", String(results.length))}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {ovResults.map((b) => (
          <Link key={b.slug} href={`/bulks/${b.slug}`} className="rounded-2xl border bg-white p-3 hover:border-slate-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{b.name}</h2>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${GROUP_TONE[b.group[0]] ?? "bg-slate-200 text-slate-700"}`}>
                {b.group === "Grain Code" ? "Grain" : `Group ${b.group}`}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {b.schedule}{b.un !== "—" ? ` · UN ${b.un}` : ""} · {b.tags.slice(0, 3).join(" · ")}
            </p>
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-slate-500">{t("bulk.noMatch")}</p>
      )}
    </div>
  );
}
