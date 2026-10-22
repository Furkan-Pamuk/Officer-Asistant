"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { COMPAT_GROUPS, cargoTags, cleaningTitle, findCargo } from "@/lib/cargo-data";

export default function CargoDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useLocale();
  const { slug } = use(params);
  const c = findCargo(slug);
  if (!c) notFound();

  const rows: [string, string][] = [
    [t("cargo.rowName"), c.name],
    [t("cargo.rowUn"), c.un],
    [t("cargo.rowIbc"), c.ibc],
    [t("cargo.rowCompat"), `Group ${c.compatGroup} — ${COMPAT_GROUPS[c.compatGroup] ?? "?"} (${c.compatSrc}, 46 CFR 150)`],
    [t("cargo.rowFormula"), c.formula],
    [t("cargo.rowBoil"), c.boiling],
    [t("cargo.rowFlash"), c.flash],
    [t("cargo.rowDensity"), c.density],
    [t("cargo.rowSol"), c.solubility],
    [t("cargo.rowSpill"), c.water === "floats" ? `Floats (floater)${c.floater !== "—" ? " — PERSISTENT FLOATER, stays floating (verify MEPC list)" : ""}` : c.water === "sinks" ? "Sinks (sinker — high density)" : c.water === "dissolves" ? "Dissolves / dilutes" : "Partly soluble"],
    [t("cargo.rowToxic"), c.toxic ? "YES — see health notes" : "Not classified toxic (still handle per SDS)"],
    [t("cargo.rowTwa"), c.tlv],
    [t("cargo.rowImdg"), c.imdg],
    [t("cargo.rowEms"), c.ems],
    [t("cargo.rowVp"), c.vapour],
    [t("cargo.rowColour"), c.colour],
    [t("cargo.rowOdour"), c.odour],
    [t("cargo.rowOt"), c.odourThreshold],
    [t("cargo.rowVisc"), c.viscosity],
    [t("cargo.rowCond"), `${c.conductivity}${c.staticAccumulator ? " — static-accumulator territory (<50 pS/m): bonding, flow control, no splash filling" : ""}`],
    ...(c.staticAccumulator ? [[t("cargo.rowStatic"), "YES — bonding, flow-rate control, no splash filling"] as [string, string]] : []),
    ...(c.drying ? [[t("cargo.rowDry"), c.drying === "non-drying" ? "Non-drying oil" : c.drying === "semi-drying" ? "SEMI-DRYING — cold wash first" : "DRYING — cold wash first"] as [string, string]] : []),
  ];

  return (
    <div className="grid gap-4">
      <Link href="/cargo" className="text-sm font-bold text-slate-600 underline">{t("cargo.back")}</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        {cargoTags(c).map((tag) => (
          <span key={tag.label} title={tag.label} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            tag.tone === "red" ? "bg-red-100 text-red-700" :
            tag.tone === "amber" ? "bg-amber-100 text-amber-800" :
            tag.tone === "yellow" ? "bg-yellow-100 text-yellow-800" :
            tag.tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-700"}`}>
            {tag.icon} {tag.label}
          </span>
        ))}
      </div>
      <p className="text-sm text-slate-500">{t("cargo.aka").replace("{x}", c.synonyms.join(" · "))}</p>
      {c.verifyIbc && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {t("cargo.unverified")}
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
        <h2 className="font-bold">{t("cargo.health")}</h2>
        <p className="mt-1 text-sm">{c.health}</p>
        <p className="mt-2 text-sm"><span className="font-bold">{t("cargo.antidote")}</span>{c.antidote}</p>
        <p className="mt-2 text-xs text-slate-500">{t("cargo.mfag")}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.gasdet")}</h2>
        <p className="mt-1 text-sm">{c.detection}</p>
        <p className="mt-2 text-xs text-slate-500">{t("cargo.gasdetHint")}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.segreg")}</h2>
        <p className="mt-1 text-sm">{t("cargo.keepAway").replace("{x}", c.segregation)}</p>
        <p className="mt-2 text-xs text-slate-500">{t("cargo.groupNote")}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.cleaning")}</h2>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {c.cleaning.map((k) => <li key={k}>{cleaningTitle(k)}</li>)}
        </ul>
        {c.cleanNote && <p className="mt-2 text-sm font-semibold text-slate-700">⚠ {c.cleanNote}</p>}
        <Link href="/cargo/cleaning" className="mt-2 inline-block text-sm font-bold text-slate-700 underline">{t("cargo.openGuide")}</Link>
      </div>
      {c.notes && <p className="text-sm text-slate-600">{c.notes}</p>}
      <p className="text-xs text-slate-400">{t("cargo.refOnly")}</p>
    </div>
  );
}
