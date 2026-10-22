"use client";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { db, getActiveContractId, uid } from "@/lib/db";
import { RANKS } from "@/lib/types";
import type { CrewRow } from "@/lib/types";

const TEMPLATE = ["Master", "Chief Officer", "2nd Officer", "3rd Officer", "Deck Cadet", "Chief Engineer", "2nd Engineer", "3rd Engineer", "ETO", "Bosun", "AB", "Oiler", "Fitter", "Cook"];
const MAX_ROWS = 40;

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) || n < 0 ? 0 : Math.round(n * 100) / 100;
};

// Fully uncontrolled: typing never triggers a React re-render.
// Remounts (via key) only when the committed value actually changes.
function Cell({ value, onCommit, placeholder, className, inputMode, list }: {
  value: string | number; onCommit: (v: string) => void; placeholder?: string; className?: string; inputMode?: "decimal" | "text"; list?: string;
}) {
  return (
    <input
      key={String(value ?? "")}
      defaultValue={value || ""}
      inputMode={inputMode}
      placeholder={placeholder}
      list={list}
      autoComplete="off"
      onBlur={(e) => { if (e.target.value !== String(value ?? "")) onCommit(e.target.value); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className={className}
    />
  );
}

async function saveRow(id: string, patch: Partial<CrewRow>) {
  await db.crewRows.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

const CrewTableRow = memo(function CrewTableRow({ row, onChanged, onAddBelow }: {
  row: CrewRow;
  onChanged: () => void;
  onAddBelow: (order: number) => void;
}) {
  const { t } = useLocale();
  const cig = Math.round(row.cigCartons * row.cigUnit * 100) / 100;
  const cell = "rounded-lg border px-1 py-0.5 text-xs w-full min-w-0";
  const numCell = cell + " text-right";
  const k = (f: string) => `${row.id}-${f}`;
  return (
    <tr className="border-t border-amber-100 dark:border-red-950">
      <td className="p-1">
        <Cell key={k("rank" + row.rank)} value={row.rank} onCommit={(v) => saveRow(row.id, { rank: v }).then(onChanged)} placeholder={t("crew.rankPh")} list="crew-ranks" className={cell} />
      </td>
      <td className="p-1"><Cell key={k("name" + row.name)} value={row.name} onCommit={(v) => saveRow(row.id, { name: v }).then(onChanged)} placeholder={t("crew.namePh")} className={cell} /></td>
      <td className="p-1"><Cell key={k("usd" + row.advUSD)} value={row.advUSD} onCommit={(v) => saveRow(row.id, { advUSD: num(v) }).then(onChanged)} placeholder={t("crew.zeroPh")} inputMode="decimal" className={numCell} /></td>
      <td className="p-1"><Cell key={k("eur" + row.advEUR)} value={row.advEUR} onCommit={(v) => saveRow(row.id, { advEUR: num(v) }).then(onChanged)} placeholder={t("crew.zeroPh")} inputMode="decimal" className={numCell} /></td>
      <td className="p-1"><Cell key={k("gbp" + row.advGBP)} value={row.advGBP} onCommit={(v) => saveRow(row.id, { advGBP: num(v) }).then(onChanged)} placeholder={t("crew.zeroPh")} inputMode="decimal" className={numCell} /></td>
      <td className="p-1">
        <div className="flex items-center gap-0.5">
          <Cell key={k("cig" + row.cigCartons)} value={row.cigCartons} onCommit={(v) => saveRow(row.id, { cigCartons: num(v) }).then(onChanged)} placeholder={t("crew.zeroPh")} inputMode="decimal" className={numCell} />
          <button onClick={() => saveRow(row.id, { cigCartons: Math.round((row.cigCartons + 1) * 100) / 100 }).then(onChanged)} title={t("crew.cartonTitle")} className="shrink-0 rounded-full border px-1.5 py-0.5 text-[11px] font-black">🚬</button>
        </div>
      </td>
      <td className="p-1"><Cell key={k("unit" + row.cigUnit)} value={row.cigUnit} onCommit={(v) => saveRow(row.id, { cigUnit: num(v) }).then(onChanged)} placeholder={t("crew.zeroPh")} inputMode="decimal" className={numCell} /></td>
      <td className="p-1 text-right font-bold">€{cig.toFixed(2)}</td>
      <td className="whitespace-nowrap p-1 text-right font-black">€{cig.toFixed(2)}+${row.advUSD.toFixed(2)}</td>
      <td className="whitespace-nowrap p-1 print:hidden">
        <button onClick={() => onAddBelow(row.order)} title={t("crew.addRowTitle")} className="rounded-full border px-1.5 py-0.5 text-[11px] font-bold">{t("crew.addRowAscii")}</button>{" "}
        <button onClick={() => db.crewRows.delete(row.id).then(onChanged)} className="font-bold text-red-600">✕</button>
      </td>
    </tr>
  );
});

export default function CrewAccountsPage() {
  const { t } = useLocale();
  const [contractId, setContractId] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [rows, setRows] = useState<CrewRow[]>([]);

  const load = useCallback(async (cid: string | null, m: string) => {
    if (!cid || !m) return;
    try {
      const all = await db.crewRows.where("[contractId+month]").equals([cid, m]).toArray();
      if (all.length === 0) {
        const now = new Date().toISOString();
        await db.crewRows.bulkPut(TEMPLATE.map((rank, i) => ({ id: `${cid}_${m}_${i}`, rank, name: "", order: i, contractId: cid, month: m, advUSD: 0, advEUR: 0, advGBP: 0, cigCartons: 0, cigUnit: 0, updatedAt: now }))).catch(() => {});
        setRows(await db.crewRows.where("[contractId+month]").equals([cid, m]).toArray());
      } else {
        setRows(all);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const id = getActiveContractId();
    setContractId(id);
    setMonth(thisMonth());
  }, []);

  useEffect(() => { load(contractId, month); }, [contractId, month, load]);

  const refresh = useCallback(() => load(contractId, month), [contractId, month, load]);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.order - b.order), [rows]);
  const tUSD = useMemo(() => sorted.reduce((a, r) => a + r.advUSD, 0), [sorted]);
  const tEUR = useMemo(() => sorted.reduce((a, r) => a + r.advEUR, 0), [sorted]);
  const tGBP = useMemo(() => sorted.reduce((a, r) => a + r.advGBP, 0), [sorted]);
  const tCig = useMemo(() => sorted.reduce((a, r) => a + r.cigCartons, 0), [sorted]);
  const tCigCost = useMemo(() => sorted.reduce((a, r) => a + r.cigCartons * r.cigUnit, 0), [sorted]);

  async function addRow(afterOrder?: number) {
    if (!contractId || !month) return;
    const s = [...rows].sort((a, b) => a.order - b.order);
    if (s.length >= MAX_ROWS) { alert(t("crew.maxRows").replace("{n}", String(MAX_ROWS))); return; }
    const order = afterOrder === undefined ? s.length : afterOrder + 1;
    for (const r of s.filter((x) => x.order >= order)) {
      await db.crewRows.update(r.id, { order: r.order + 1 });
    }
    await db.crewRows.add({ id: uid("crew"), contractId, month, rank: "", name: "", order, advUSD: 0, advEUR: 0, advGBP: 0, cigCartons: 0, cigUnit: 0, updatedAt: new Date().toISOString() });
    refresh();
  }

  function sheetText() {
    const lines = [`Crew accounts — ${month}`, ...sorted.map((r) => {
      const cig = Math.round(r.cigCartons * r.cigUnit * 100) / 100;
      return `• ${r.rank} ${r.name} — $${r.advUSD} / €${r.advEUR} / £${r.advGBP} — cig ${r.cigCartons} @€${r.cigUnit} = €${cig.toFixed(2)}`;
    })];
    lines.push(`TOTAL: $${tUSD.toFixed(2)} / €${tEUR.toFixed(2)} / £${tGBP.toFixed(2)} — cig €${tCigCost.toFixed(2)}`);
    return lines.join("\n");
  }

  async function share() {
    const text = sheetText();
    try {
      if (navigator.share) { await navigator.share({ title: `Crew accounts ${month}`, text }); return; }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert(t("crew.copied"));
      } catch { alert(t("common.noShare")); }
    }
  }

  function exportCSV() {
    const head = "rank,name,adv_usd,adv_eur,adv_gbp,cig_cartons,cig_unit_eur,cig_total_eur,totals_eur_plus_usd";
    const lines = sorted.map((r) => {
      const cig = r.cigCartons * r.cigUnit;
      return [r.rank, r.name, r.advUSD, r.advEUR, r.advGBP, r.cigCartons, r.cigUnit, cig.toFixed(2), `EUR ${cig.toFixed(2)} + USD ${r.advUSD.toFixed(2)}`].map((v) => `"${v}"`).join(",");
    });
    const blob = new Blob([[head, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crew-accounts-${month}.csv`;
    a.click();
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("crew.title")}</h1>
        <p className="text-sm">{t("common.needContract")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t("crew.titleVessel")}</h1>
          <p className="text-sm font-medium opacity-70">{t("crew.sub")}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-xl border px-2 py-1.5 text-sm font-bold" />
          <button onClick={exportCSV} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">CSV</button>
          <button onClick={share} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
          <button onClick={() => window.print()} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amber-200 dark:border-red-950">
        <table className="w-full border-collapse bg-white text-xs dark:bg-neutral-950">
          <thead>
            <tr className="bg-amber-100 text-left dark:bg-red-950">
              <th className="p-1">{t("crew.hRank")}</th><th className="p-1">{t("crew.hName")}</th>
              <th className="p-1">{t("crew.hAdvD")}</th><th className="p-1">{t("crew.hAdvE")}</th><th className="p-1">{t("crew.hAdvP")}</th>
              <th className="p-1">{t("crew.hCig")}</th><th className="p-1">{t("crew.hUnitE")}</th>
              <th className="p-1">{t("crew.hCigE")}</th><th className="p-1">{t("crew.hTotals")}</th><th className="p-1 print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <CrewTableRow key={r.id} row={r} onChanged={refresh} onAddBelow={(o) => addRow(o)} />
            ))}
            <tr className="border-t-2 border-stone-900 bg-amber-50 font-black dark:border-red-700 dark:bg-red-950/30">
              <td className="p-1" colSpan={2}>{t("crew.totalN").replace("{n}", String(sorted.length))}</td>
              <td className="p-1 text-right">${tUSD.toFixed(0)}</td>
              <td className="p-1 text-right">€{tEUR.toFixed(0)}</td>
              <td className="p-1 text-right">£{tGBP.toFixed(0)}</td>
              <td className="p-1 text-right">{tCig}</td>
              <td className="p-1">—</td>
              <td className="p-1 text-right">€{tCigCost.toFixed(0)}</td>
              <td className="p-1 text-right">€{tCigCost.toFixed(0)}+${tUSD.toFixed(0)}</td>
              <td className="p-1 print:hidden"><button onClick={() => addRow()} className="rounded-full border px-1.5 py-0.5 text-[11px] font-bold">{t("crew.addRowAscii")}</button></td>
            </tr>
          </tbody>
        </table>
        <datalist id="crew-ranks">{RANKS.map((r) => <option key={r} value={r} />)}</datalist>
      </div>
      <p className="text-xs opacity-70">{t("crew.cigHint")}</p>
    </div>
  );
}
