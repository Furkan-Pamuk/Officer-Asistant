"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { findGas } from "@/lib/gas-data";

export default function GasDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { t } = useLocale();
  const { slug } = use(params);
  const g = findGas(slug);
  if (!g) notFound();

  const rows: [string, string][] = [
    [t("cargo.rowName"), g.name],
    [t("cargo.rowUn"), g.un],
    [t("cargo.rowFormula"), g.formula],
    [t("gas.rowBp"), g.boiling],
    [t("gas.rowLiq"), g.density],
    [t("gas.rowFlam"), g.flammability],
    [t("cargo.rowToxic"), g.toxic ? "YES — see health notes" : t("gas.asphyx")],
    [t("gas.rowExp"), g.tlv],
    [t("gas.rowCarriage"), g.carriage],
  ];

  return (
    <div className="grid gap-4">
      <Link href="/gas" className="text-sm font-bold text-slate-600 underline">{t("gas.back")}</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">{g.name}</h1>
        {g.toxic && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">{t("gas.toxicTag")}</span>}
      </div>
      <p className="text-sm text-slate-500">{t("cargo.aka").replace("{x}", g.synonyms.join(" · "))}</p>
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
        <p className="mt-1 text-sm">{g.health}</p>
        <p className="mt-2 text-xs text-slate-500">{t("gas.coldBurn")}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.segreg")}</h2>
        <p className="mt-1 text-sm">{t("cargo.keepAway").replace("{x}", g.segregation)}</p>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-bold">{t("cargo.gasdet")}</h2>
        <p className="mt-1 text-sm">{g.detection}</p>
      </div>
      {g.notes && <p className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">⚠️ {g.notes}</p>}
      <p className="text-xs text-slate-400">{t("gas.refOnly")}</p>
    </div>
  );
}
