"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BULKS, searchBulks } from "@/lib/imsbc-data";

const GROUPS = ["All", "A", "B", "C"] as const;
const GROUP_TONE: Record<string, string> = {
  A: "bg-red-100 text-red-700",
  B: "bg-amber-100 text-amber-800",
  C: "bg-teal-100 text-teal-800",
};

export default function BulkBooklet() {
  const [q, setQ] = useState("");
  const [g, setG] = useState<string>("All");
  const results = useMemo(() => {
    const found = searchBulks(q);
    return g === "All" ? found : found.filter((b) => b.group === g || (g === "A" && b.group === "A and B") || (g === "B" && b.group === "A and B"));
  }, [q, g]);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">🧱 Solid Bulk Booklet (IMSBC)</h1>
        <p className="text-sm text-slate-600">
          Search by cargo name, schedule or UN number. {BULKS.length} common solid bulk cargoes.
          Groups verified against IMSBC schedules — guidance is paraphrased; the Code and shipper certificates govern.
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type cargo name, schedule or UN no. — e.g. coal, nickel, 1408…"
        className="w-full rounded-2xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        aria-label="Search solid bulk cargoes"
      />
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((c) => (
          <button
            key={c}
            onClick={() => setG(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${g === c ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}
          >
            {c === "All" ? "All groups" : `Group ${c}`}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">{results.length} cargo{results.length === 1 ? "" : "es"}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {results.map((b) => (
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
        <p className="text-sm text-slate-500">No cargo found. Check spelling, or confirm the Bulk Cargo Shipping Name in IMSBC Appendix 1.</p>
      )}
    </div>
  );
}
