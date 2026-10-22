"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useLocale } from "@/lib/i18n";
import type { Contract } from "@/lib/types";

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export function fmtService(totalDays: number) {
  const m = Math.floor(totalDays / 30);
  const d = totalDays % 30;
  return `${m} ay ${d} gün`;
}

export function contractDays(c: Contract, today = new Date()): number | null {
  const start = parseDate(c.signOnDate);
  if (!start) return null;
  const end = parseDate(c.signOffDate) ?? today;
  return daysBetween(start, end) + 1;
}

export default function ServiceBoard({ contracts, activeId, highlightEst, onEstSaved }: { contracts: Contract[]; activeId: string | null; highlightEst?: boolean; onEstSaved?: () => void }) {
  const { t } = useLocale();
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => { setToday(new Date()); }, []);
  useEffect(() => {
    if (highlightEst) {
      document.getElementById("est-signoff")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightEst]);
  if (!today) return <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50">{t("sb.loading")}</div>;
  const byRank = new Map<string, number>();
  let total = 0;
  for (const c of contracts) {
    const d = contractDays(c, today);
    if (d === null) continue;
    total += d;
    byRank.set(c.rank || "Unknown", (byRank.get(c.rank || "Unknown") ?? 0) + d);
  }
  const active = contracts.find((c) => c.id === activeId) ?? null;
  const activeDays = active ? contractDays(active, today) : null;
  const estEnd = active?.estimatedEndDate ? parseDate(active.estimatedEndDate) : null;
  const left = estEnd ? Math.ceil((estEnd.getTime() - today.getTime()) / 86400000) : null;

  async function setEst(id: string, v: string) {
    await db.contracts.update(id, { estimatedEndDate: v, updatedAt: new Date().toISOString() });
    onEstSaved?.();
  }

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">{t("sb.total")}</div>
          <div className="text-3xl font-bold">{fmtService(total)} <span className="text-sm font-medium opacity-70">({total} days)</span></div>
        </div>
        {active && activeDays !== null && (
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">{t("sb.ship").replace("{s}", active.shipName)}</div>
            <div className="text-3xl font-bold">{t("ac.day").replace("{n}", String(activeDays))}</div>
          </div>
        )}
        {active && (
          <div id="est-signoff" className={`flex items-center gap-2 text-sm ${highlightEst ? "animate-pulse rounded-2xl bg-amber-400/30 p-2 ring-2 ring-amber-400 dark:bg-red-950/40 dark:ring-red-500" : ""}`}>
            <label className="font-bold">{t("sb.est")}</label>
            <input type="date" value={active.estimatedEndDate ?? ""} onChange={(e) => setEst(active.id, e.target.value)} className="rounded-xl border border-amber-300 bg-white px-2 py-1 font-bold text-stone-900 dark:border-amber-300 dark:bg-white dark:text-stone-900" />
            {left !== null && <span className={`rounded-full px-3 py-1 font-bold ${left <= 14 ? "bg-red-600 text-white" : "bg-amber-400 text-stone-950"}`}>{left < 0 ? t("sb.over").replace("{n}", String(-left)) : t("sb.left").replace("{n}", String(left))}</span>}
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {[...byRank.entries()].sort((a, b) => b[1] - a[1]).map(([rank, days]) => (
          <span key={rank} className="rounded-full bg-white/10 px-3 py-1 font-bold ring-1 ring-white/20 dark:bg-red-950/40 dark:ring-red-900">
            {rank || "Unknown"}: {fmtService(days)}
          </span>
        ))}
        {byRank.size === 0 && <span className="opacity-70">{t("sb.addBelow")}</span>}
      </div>
    </div>
  );
}
