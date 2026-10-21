"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GASES, searchGases } from "@/lib/gas-data";

export default function GasBooklet() {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchGases(q), [q]);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">🧊 Gas Cargoes (LPG / LNG)</h1>
        <p className="text-sm text-slate-600">
          Search by cargo name or UN number. {GASES.length} liquefied gases (IGC Code).
          Indicative values — SDS, IGC Code and terminal compatibility govern.
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type gas name or UN no. — e.g. propane, 1972, ammonia…"
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label="Search gas cargoes"
      />
      <p className="text-xs text-slate-500">{results.length} cargo{results.length === 1 ? "" : "es"}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {results.map((g) => (
          <Link key={g.slug} href={`/gas/${g.slug}`} className="rounded-2xl border bg-white p-3 hover:border-slate-500">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{g.name}</h2>
              {g.toxic && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">☠</span>}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              UN {g.un} · bp {g.boiling} · {g.flammability}
            </p>
          </Link>
        ))}
      </div>
      {results.length === 0 && (
        <p className="text-sm text-slate-500">No gas found. Check spelling or UN number.</p>
      )}
    </div>
  );
}
