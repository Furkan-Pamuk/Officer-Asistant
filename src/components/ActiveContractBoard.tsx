"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { contractDays } from "@/components/ServiceBoard";
import { useActiveContract } from "@/hooks/useActiveContract";
import { useLocale } from "@/lib/i18n";

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? null : d;
}

// Big dark counter merged with the active-contract box — same look as the contracts billboard.
export default function ActiveContractBoard() {
  const { t } = useLocale();
  const { contract } = useActiveContract();
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => { setToday(new Date()); }, []);

  if (contract === undefined || !today) {
    return <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50">{t("common.loading")}</div>;
  }
  if (!contract) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 text-sm dark:border-red-800 dark:bg-red-950/20">
        <strong>{t("cb.noSel")}</strong> {t("ac.pick")}
        <Link href="/contracts" className="ml-2 rounded-full bg-stone-900 px-3 py-1 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("cb.select")}</Link>
      </div>
    );
  }

  const days = contractDays(contract, today) ?? 0;
  const estEnd = contract.estimatedEndDate ? parseDate(contract.estimatedEndDate) : null;
  const left = estEnd ? Math.ceil((estEnd.getTime() - today.getTime()) / 86400000) : null;

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">{t("ac.onboard").replace("{x}", contract.shipName)} ({contract.rank})</div>
          <div className="text-4xl font-black">{t("ac.day").replace("{n}", String(days))}</div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">{t("ac.est")}</div>
          {left !== null ? (
            <div className={`text-4xl font-black ${left <= 14 ? "text-red-400" : ""}`}>{left < 0 ? t("ac.over").replace("{n}", String(-left)) : t("ac.left").replace("{n}", String(left))}</div>
          ) : (
            <Link href="/contracts#est-signoff" className="text-sm font-bold underline">{t("ac.setDate")}</Link>
          )}
        </div>
        <div className="text-sm font-medium opacity-80">
          {contract.shipType} • joined {contract.signOnDate} at {contract.joinPort || "—"}
          {contract.estimatedEndDate ? ` • est. ${contract.estimatedEndDate}` : ""}
        </div>
      </div>
    </div>
  );
}
