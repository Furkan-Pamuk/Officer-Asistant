"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CARGOES, CARGO_CATEGORIES, searchCargoes } from "@/lib/cargo-data";

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
        <h1 className="text-2xl font-bold">📖 Cargo Information Booklet</h1>
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
                {c.toxic && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">☠</span>}
                {c.floater !== "—" && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">🌊</span>}
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
