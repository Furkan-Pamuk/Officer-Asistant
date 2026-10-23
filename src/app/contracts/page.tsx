"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import Link from "next/link";
import { db, setActiveContractId, uid, exportJSON, getActiveContractId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { getGibsStatus } from "@/lib/gibs";
import ServiceBoard from "@/components/ServiceBoard";
import FieldError from "@/components/FieldError";
import DateField from "@/components/DateField";
import { playShipHorn } from "@/lib/horn";
import { RANKS, departmentForRank } from "@/lib/types";
import { FLAG_STATES, flagName } from "@/lib/flags";

const SHIP_TYPES: { value: string; key: string }[] = [
  { value: "Bulk carrier", key: "ctr.shipBulk" },
  { value: "Tanker (oil)", key: "ctr.shipTanker" },
  { value: "Chemical tanker", key: "ctr.shipChemical" },
  { value: "LPG/LNG", key: "ctr.shipGas" },
  { value: "Container", key: "ctr.shipContainer" },
  { value: "Ro-Ro", key: "ctr.shipRoro" },
  { value: "General cargo", key: "ctr.shipGeneral" },
  { value: "Offshore", key: "ctr.shipOffshore" },
  { value: "Other", key: "ctr.shipOther" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function RunnerOverlay({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  useEffect(() => {
    const timer = setTimeout(onDone, 4200);
    return () => clearTimeout(timer);
  }, [onDone]);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="oa-caption">{t("ctr.signedOff")}</div>
      <div className="oa-runner absolute top-1/3" aria-hidden>
        <svg width="130" height="170" viewBox="0 0 120 170">
          {/* back leg */}
          <g className="oa-leg oa-leg-back">
            <rect x="50" y="92" width="11" height="52" rx="5" fill="#334155" />
            <rect x="46" y="138" width="19" height="9" rx="4" fill="#111827" />
          </g>
          {/* suitcase arm (front-side, holds case) */}
          <rect x="66" y="52" width="9" height="42" rx="4" fill="#1e3a8a" />
          {/* torso */}
          <rect x="44" y="46" width="26" height="52" rx="11" fill="#1e3a8a" />
          <rect x="44" y="60" width="26" height="7" fill="#fbbf24" />
          {/* waving arm */}
          <g className="oa-wave-arm">
            <rect x="30" y="18" width="9" height="38" rx="4" fill="#1e3a8a" />
            <circle cx="34" cy="14" r="7" fill="#f2c89b" />
          </g>
          {/* head + cap */}
          <circle cx="57" cy="30" r="14" fill="#f2c89b" />
          <rect x="41" y="14" width="32" height="9" rx="4" fill="#0f172a" />
          <rect x="41" y="21" width="32" height="4" fill="#0f172a" />
          {/* front leg */}
          <g className="oa-leg oa-leg-front">
            <rect x="60" y="92" width="11" height="52" rx="5" fill="#475569" />
            <rect x="60" y="138" width="19" height="9" rx="4" fill="#111827" />
          </g>
          {/* suitcase */}
          <g>
            <rect x="72" y="52" width="7" height="22" rx="3" fill="#78350f" />
            <rect x="76" y="72" width="34" height="28" rx="4" fill="#92400e" />
            <rect x="76" y="72" width="34" height="28" rx="4" fill="none" stroke="#451a03" strokeWidth="2" />
            <rect x="90" y="80" width="6" height="12" rx="2" fill="#fbbf24" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  useDocTitle("ctr.title");
  const { t } = useLocale();
  const contracts = useLiveQuery(() => db.contracts.orderBy("updatedAt").reverse().toArray(), []);
  const [form, setForm] = useState({ shipName: "", shipType: "Bulk carrier", joinPort: "", signOnDate: "", signOffDate: "", rank: "", company: "", flag: "" });
  const [customRank, setCustomRank] = useState(false);
  const [endDates, setEndDates] = useState<Record<string, string>>({});
  const [runner, setRunner] = useState(0);
  const [flagEdit, setFlagEdit] = useState<Record<string, string>>({});
  const [estGuide, setEstGuide] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const activeId = typeof window !== "undefined" ? getActiveContractId() : null;

  useEffect(() => {
    db.profile.get("me").then((p) => {
      if (p?.rank) setForm((f) => (f.rank ? f : { ...f, rank: p.rank }));
    });
    if (window.location.hash === "#est-signoff") setEstGuide(true);
  }, []);

  async function syncProfileRank(rank: string) {
    if (!rank) return;
    const now = new Date().toISOString();
    const p = await db.profile.get("me");
    await db.profile.put({ id: "me", displayName: p?.displayName ?? "", rank, nationality: p?.nationality ?? "", department: departmentForRank(rank), photoDataUrl: p?.photoDataUrl ?? "", updatedAt: now });
  }

  async function create() {
    if (!form.shipName.trim() || !form.signOnDate) { setFormErr(t("ctr.needShip")); return; }
    setFormErr(null);
    const now = new Date().toISOString();
    const id = uid("con");
    await db.contracts.add({ id, shipName: form.shipName.trim(), shipType: form.shipType, joinPort: form.joinPort, signOnDate: form.signOnDate, signOffDate: "", flag: form.flag || undefined, rank: form.rank, company: form.company, status: "active", createdAt: now, updatedAt: now });
    setActiveContractId(id);
    await syncProfileRank(form.rank);
    playShipHorn();
    setForm({ shipName: "", shipType: "Bulk carrier", joinPort: "", signOnDate: "", signOffDate: "", rank: "", company: "", flag: "" });
  }

  async function addAsArchive() {
    if (!form.shipName.trim() || !form.signOnDate) { setFormErr(t("ctr.needShip")); return; }
    if (!form.signOffDate) { setFormErr(t("ctr.pickSignoff")); return; }
    setFormErr(null);
    const now = new Date().toISOString();
    await db.contracts.add({ id: uid("con"), shipName: form.shipName.trim(), shipType: form.shipType, joinPort: form.joinPort, signOnDate: form.signOnDate, signOffDate: form.signOffDate, flag: form.flag || undefined, rank: form.rank, company: form.company, status: "archived", createdAt: now, updatedAt: now });
    setForm({ shipName: "", shipType: "Bulk carrier", joinPort: "", signOnDate: "", signOffDate: "", rank: "", company: "", flag: "" });
  }

  async function endContract(id: string) {
    const date = endDates[id] || todayISO();
    if (!confirm(t("ctr.confirmSignoff").replace("{d}", date))) return;
    await db.contracts.update(id, { status: "archived", signOffDate: date, updatedAt: new Date().toISOString() });
    setRunner((r) => r + 1);
  }

  async function reactivate(id: string) {
    await db.contracts.update(id, { status: "active", updatedAt: new Date().toISOString() });
    setActiveContractId(id);
    playShipHorn();
  }

  async function saveFlag(id: string) {
    const v = flagEdit[id] ?? "";
    if (!v) { alert(t("ctr.needFlag")); return; }
    await db.contracts.update(id, { flag: v, updatedAt: new Date().toISOString() });
    setFlagEdit((m) => { const c = { ...m }; delete c[id]; return c; });
  }

  return (
    <div className="shark-interior-page">
      <div className="grid gap-4">
      {runner > 0 && <RunnerOverlay key={runner} onDone={() => setRunner(0)} />}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("ctr.title")}</h1>
          <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">{t("ctr.sub")}</p>
        </div>
        <button onClick={() => contracts && exportJSON("contracts.json", contracts)} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">{t("common.export")}</button>
      </div>

      <ServiceBoard contracts={contracts ?? []} activeId={activeId} highlightEst={estGuide} onEstSaved={() => setEstGuide(false)} />

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">{t("ctr.new")}</h2>
        <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm">
          <input value={form.shipName} onChange={(e) => setForm({ ...form, shipName: e.target.value })} placeholder={t("ctr.vesselPh")} list="vessel-history" autoComplete="off" className="rounded-xl border px-3 py-2" />
          <select value={form.shipType} onChange={(e) => setForm({ ...form, shipType: e.target.value })} className="rounded-xl border px-3 py-2">
            {SHIP_TYPES.map((s) => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
          </select>
          <input value={form.joinPort} onChange={(e) => setForm({ ...form, joinPort: e.target.value })} placeholder={t("ctr.portPh")} className="rounded-xl border px-3 py-2" />
          <DateField value={form.signOnDate} onChange={(v) => setForm({ ...form, signOnDate: v })} placeholder={t("ctr.onPh")} className="rounded-xl border px-3 py-2" />
          <DateField value={form.signOffDate} onChange={(v) => setForm({ ...form, signOffDate: v })} placeholder={t("ctr.offPh")} className="rounded-xl border px-3 py-2" />
          <select
            value={form.rank !== "" && !RANKS.includes(form.rank) ? "__custom" : form.rank}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom") setCustomRank(true);
              else { setCustomRank(false); setForm({ ...form, rank: v }); }
            }}
            className="rounded-xl border px-3 py-2"
          >
            <option value="">{t("ctr.rankPh")}</option>
            {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="__custom">{t("ctr.otherRank")}</option>
          </select>
          {(customRank || (form.rank !== "" && !RANKS.includes(form.rank))) && (
            <input value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder={t("ctr.typeRankPh")} autoComplete="off" className="rounded-xl border px-3 py-2" />
          )}
          <span className="self-center text-xs font-bold opacity-70">{t("ctr.deptAuto").replace("{d}", departmentForRank(form.rank) || "—")}</span>
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={t("ctr.companyPh")} list="company-history" autoComplete="off" className="rounded-xl border px-3 py-2" />
          <select value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} className="rounded-xl border px-3 py-2" title={t("ctr.flagTitle")}>
            <option value="">{t("ctr.flagPh")}</option>
            {FLAG_STATES.map((f) => <option key={f.code} value={f.code}>{f.name}</option>)}
          </select>
        </div>
        <datalist id="vessel-history">
          {Array.from(new Set((contracts ?? []).map((c) => c.shipName).filter(Boolean))).map((n) => <option key={n} value={n} />)}
        </datalist>
        <datalist id="company-history">
          {Array.from(new Set((contracts ?? []).map((c) => c.company).filter(Boolean))).map((n) => <option key={n} value={n} />)}
        </datalist>
        <FieldError msg={formErr} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={create} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("ctr.create")}</button>
          <button onClick={addAsArchive} className="rounded-full border border-amber-400 px-4 py-2 text-sm font-bold dark:border-red-800">{t("ctr.archiveAdd")}</button>
        </div>
      </div>

      <div className="grid gap-2">
        {(contracts ?? []).map((c) => (
          <div key={c.id} className={`rounded-2xl border p-4 text-sm ${c.id === activeId ? "border-emerald-500 bg-emerald-50/50 dark:border-red-600 dark:bg-red-950/20" : "border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-base">{c.shipName}</strong>
              <span>{c.shipType}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold dark:bg-red-950 dark:text-red-200">{c.status}</span>
              {c.id === activeId && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">{t("ctr.active")}</span>}
              <span className="ml-auto flex flex-wrap items-center gap-2">
                <Link href={`/contracts/${c.id}`} className="rounded-full border px-3 py-1 text-xs font-bold">{t("ctr.viewArchive")}</Link>
                <button onClick={() => setActiveContractId(c.id)} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("ctr.useThis")}</button>
                {c.status === "active" ? (
                  <>
                    <input
                      type="date"
                      value={endDates[c.id] ?? todayISO()}
                      onChange={(e) => setEndDates({ ...endDates, [c.id]: e.target.value })}
                      title={t("ctr.signoffDate")}
                      className="rounded-full border px-2 py-1 text-xs"
                    />
                    <button onClick={() => endContract(c.id)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-bold text-red-700">{t("ctr.end")}</button>
                  </>
                ) : (
                  <button onClick={() => reactivate(c.id)} className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-bold text-emerald-700">{t("ctr.reactivate")}</button>
                )}
              </span>
            </div>
            <div className="mt-1 font-medium text-stone-600 dark:text-red-300/70">
              {t("ctr.rank")} {c.rank || "—"} • {t("ctr.company")} {c.company || "—"} • {t("ctr.joined")} {c.signOnDate} {t("ctr.at")} {c.joinPort || "—"}{c.signOffDate ? t("ctr.signedOffOn").replace("{d}", c.signOffDate) : ""}
              {c.flag ? t("ctr.flagN").replace("{x}", flagName(c.flag)) : ""}
              {(() => {
                const g = getGibsStatus(c);
                if (g.done) return <span className="ml-2 font-bold text-emerald-700">{t("ctr.gibsOk")}</span>;
                if (g.daysLeft === null) return null;
                if (g.overdue) return <span className="ml-2 font-bold text-red-700">{t("ctr.gibsOver")}</span>;
                return <span className={`ml-2 font-bold ${g.urgent ? "text-red-700" : ""}`}>{t("ctr.gibsLeft").replace("{n}", String(g.daysLeft))}</span>;
              })()}
            </div>
            {!c.flag && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                <select value={flagEdit[c.id] ?? ""} onChange={(e) => setFlagEdit({ ...flagEdit, [c.id]: e.target.value })} className="w-44 rounded-xl border px-2 py-1">
                  <option value="">{t("ctr.flagPh")}</option>
                  {FLAG_STATES.map((f) => <option key={f.code} value={f.code}>{f.name}</option>)}
                </select>
                <button onClick={() => saveFlag(c.id)} className="rounded-full border px-3 py-1 font-bold">{t("ctr.saveFlag")}</button>
              </div>
            )}
          </div>
        ))}
        {(contracts ?? []).length === 0 && <p className="text-sm">{t("ctr.empty")}</p>}
      </div>
    </div>
    </div>
  );
}
