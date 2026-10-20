import Link from "next/link";
import { notFound } from "next/navigation";
import { CARGOES, cleaningTitle, findCargo } from "@/lib/cargo-data";

export function generateStaticParams() {
  return CARGOES.map((c) => ({ slug: c.slug }));
}

export default async function CargoDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = findCargo(slug);
  if (!c) notFound();

  const rows: [string, string][] = [
    ["Cargo name", c.name],
    ["UN number", c.un],
    ["IBC / MARPOL status", c.ibc],
    ["Chemical formula", c.formula],
    ["Boiling point", c.boiling],
    ["Flash point", c.flash],
    ["Density (water = 1)", c.density],
    ["Solubility in water", c.solubility],
    ["Spill behaviour", c.water === "floats" ? "Floats (floater)" : c.water === "sinks" ? "Sinks (sinker — high density)" : c.water === "dissolves" ? "Dissolves / dilutes" : "Partly soluble"],
    ["Toxic", c.toxic ? "YES — see health notes" : "Not classified toxic (still handle per SDS)"],
    ...(c.staticAccumulator ? [["Static accumulator", "YES — bonding, flow-rate control, no splash filling"] as [string, string]] : []),
    ...(c.drying ? [["Drying-oil class", c.drying === "non-drying" ? "Non-drying oil" : c.drying === "semi-drying" ? "SEMI-DRYING — cold wash first" : "DRYING — cold wash first"] as [string, string]] : []),
  ];

  return (
    <div className="grid gap-4">
      <Link href="/cargo" className="text-sm font-bold text-slate-600 underline">← Back to booklet</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        {c.toxic && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">☠ toxic</span>}
      </div>
      <p className="text-sm text-slate-500">Also known as: {c.synonyms.join(" · ")}</p>
      {c.verifyIbc && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          ⚠ IBC category letters for this product were not letter-verified from our tables — confirm them in the current IBC Code edition before use.
        </p>
      )}
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
        <p className="mt-1 text-sm">{c.health}</p>
        <p className="mt-2 text-xs text-slate-500">First aid per the SDS / MFAG. Antidotes are hospital-administered — never delay evacuation and medical advice.</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">🚧 Compatibility / segregation</h2>
        <p className="mt-1 text-sm">Keep away from: {c.segregation}</p>
        <p className="mt-2 text-xs text-slate-500">Check the USCG CHRIS compatibility group and the SDS before stowing next to other cargoes (see Tank Cleaning Methods page).</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">🧽 Tank cleaning</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {c.cleaning.map((k) => <li key={k}>{cleaningTitle(k)}</li>)}
        </ul>
        {c.cleanNote && <p className="mt-2 text-sm font-semibold text-slate-700">⚠ {c.cleanNote}</p>}
        <Link href="/cargo/cleaning" className="mt-2 inline-block text-sm font-bold text-slate-700 underline">Open full cleaning guide →</Link>
      </div>
      {c.notes && <p className="text-sm text-slate-600">{c.notes}</p>}
      <p className="text-xs text-slate-400">Indicative reference only — SDS, IBC/IGC Code and the ship&apos;s P&A Manual govern.</p>
    </div>
  );
}
