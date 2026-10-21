import Link from "next/link";
import { notFound } from "next/navigation";
import { BULKS, findBulk } from "@/lib/imsbc-data";

export function generateStaticParams() {
  return BULKS.map((b) => ({ slug: b.slug }));
}

export default async function BulkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = findBulk(slug);
  if (!b) notFound();

  const rows: [string, string][] = [
    ["Cargo name", b.name],
    ["IMSBC schedule", b.schedule],
    ["Group", b.group === "A" ? "A — may liquefy" : b.group === "B" ? "B — chemical hazard" : b.group === "C" ? "C — no special hazard" : b.group === "A and B" ? "A and B — liquefaction + chemical hazard" : "Grain Code (behaves as Group C)"],
    ["UN number", b.un],
    ["Ventilation", b.ventilation],
    ["Moisture / TML", b.moisture],
  ];

  return (
    <div className="grid gap-4">
      <Link href="/bulks" className="text-sm font-bold text-slate-600 underline">← Back to booklet</Link>
      <h1 className="text-2xl font-bold">{b.name}</h1>
      <p className="text-sm text-slate-500">Also known as: {b.synonyms.join(" · ")}</p>
      <div className="flex flex-wrap gap-1.5">
        {b.tags.map((t) => (
          <span key={t} className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">{t}</span>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-b last:border-0">
                <td className="w-40 bg-slate-50 px-3 py-2 align-top font-bold text-slate-600">{k}</td>
                <td className="px-3 py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">⚠️ Key precautions</h2>
        <ul className="mt-1 grid gap-1.5">
          {b.precautions.map((p, i) => (
            <li key={i} className="list-disc pl-5 text-sm">{p}</li>
          ))}
        </ul>
      </div>
      {b.note && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">ℹ️ {b.note}</p>}
      <p className="text-xs text-slate-400">Study reference only — IMSBC Code, Grain Code, shipper certificates (TML/FMP) and the master&apos;s judgment govern.</p>
    </div>
  );
}
