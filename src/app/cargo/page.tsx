"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CARGOES, CARGO_CATEGORIES, cargoTags, searchCargoes } from "@/lib/cargo-data";

export default function CargoBooklet() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const results = useMemo(() => {
    const found = searchCargoes(q);
    return cat === "All" ? found : found.filter((c) => c.category === cat);
  }, [q, cat]);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">🧪 Chemical / Oil Booklet</h1>
        <p className="text-sm text-slate-600">
          Search by cargo name or UN number. {CARGOES.length} common bulk liquid cargoes.
          Values are indicative — the SDS and the IBC/IGC Code always govern.
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type cargo name or UN no. — e.g. methanol, 1230, toluene…"
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label="Search cargoes"
      />
      <div className="flex flex-wrap gap-1.5">
        {["All", ...CARGO_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${cat === c ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{results.length} cargo{results.length === 1 ? "" : "es"}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {results.map((c) => (
          <Link key={c.slug} href={`/cargo/${c.slug}`} className="rounded-2xl border bg-white p-3 hover:border-slate-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{c.name}</h2>
              <span className="flex shrink-0 gap-1">
                {cargoTags(c).map((t) => (
                  <span key={t.label} title={t.label} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    t.tone === "red" ? "bg-red-100 text-red-700" :
                    t.tone === "amber" ? "bg-amber-100 text-amber-800" :
                    t.tone === "yellow" ? "bg-yellow-100 text-yellow-800" :
                    t.tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-700"}`}>{t.icon}</span>
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
        <p className="text-sm text-slate-500">No cargo found. Check spelling or UN number, or confirm the product name in the IBC Code index.</p>
      )}
    </div>
  );
}
