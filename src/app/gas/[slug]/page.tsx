import Link from "next/link";
import { notFound } from "next/navigation";
import { GASES, findGas } from "@/lib/gas-data";

export function generateStaticParams() {
  return GASES.map((g) => ({ slug: g.slug }));
}

export default async function GasDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = findGas(slug);
  if (!g) notFound();

  const rows: [string, string][] = [
    ["Cargo name", g.name],
    ["UN number", g.un],
    ["Chemical formula", g.formula],
    ["Boiling point", g.boiling],
    ["Liquid density (water = 1)", g.density],
    ["Flammability", g.flammability],
    ["Toxic", g.toxic ? "YES — see health notes" : "Asphyxiant risk (displaces oxygen)"],
    ["Exposure limit", g.tlv],
    ["Typical carriage", g.carriage],
  ];

  return (
    <div className="grid gap-4">
      <Link href="/gas" className="text-sm font-bold text-slate-600 underline">← Back to gases</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{g.name}</h1>
        {g.toxic && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">☠ toxic</span>}
      </div>
      <p className="text-sm text-slate-500">Also known as: {g.synonyms.join(" · ")}</p>
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
        <h2 className="font-bold">🏥 Health hazards & first aid</h2>
        <p className="mt-1 text-sm">{g.health}</p>
        <p className="mt-2 text-xs text-slate-500">First aid per the SDS / MFAG. Cold burns: lukewarm water, no rubbing, hospital.</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">🚧 Compatibility / segregation</h2>
        <p className="mt-1 text-sm">Keep away from: {g.segregation}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">🧪 Gas detection</h2>
        <p className="mt-1 text-sm">{g.detection}</p>
      </div>
      {g.notes && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">⚠️ {g.notes}</p>}
      <p className="text-xs text-slate-400">Indicative reference only — IGC product table (ship type), SDS and terminal compatibility govern.</p>
    </div>
  );
}
