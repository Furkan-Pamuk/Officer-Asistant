import Link from "next/link";
import { INSPECTION_TYPES, SEED_CARDS } from "@/lib/data";

export default function Inspections() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Select inspection type</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {INSPECTION_TYPES.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-white p-4">
            <div className="text-xs font-bold text-sky-700">{t.short}</div>
            <h2 className="font-semibold">{t.name}</h2>
            <p className="text-sm text-slate-600">{t.description}</p>
            <p className="mt-1 text-xs text-slate-500">Source: <a className="underline" href={t.sourceUrl} target="_blank" rel="noreferrer">{t.source}</a></p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">{SEED_CARDS.filter((c) => c.inspection === t.id).length} check cards</span>
              <Link href={`/inspections/${t.id}`} className="rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white">Open cards</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
