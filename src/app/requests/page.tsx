"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { db, uid, exportJSON, getActiveContractId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { parseCatalogueCSV, importCatalogue, learnFromHistory } from "@/lib/catalogue";
import type { CatalogueItem, RequestTab, SavedList, SavedListItem, StoreRequest } from "@/lib/types";

type Scope = RequestTab | "all";

const TABS: Scope[] = ["all", "galley", "stationery", "spare-deck", "spare-engine", "other"];

function tabKey(id: Scope): string {
  switch (id) {
    case "all": return "req.tabAll";
    case "galley": return "req.tabGalley";
    case "stationery": return "req.tabStationery";
    case "spare-deck": return "req.tabDeck";
    case "spare-engine": return "req.tabEngine";
    default: return "req.tabOther";
  }
}

const TAB_IDS: RequestTab[] = ["galley", "stationery", "spare-deck", "spare-engine", "other"];

function normCat(c: string): RequestTab {
  // Legacy values pass through unchanged.
  if ((TAB_IDS as string[]).includes(c)) return c as RequestTab;
  // Official IMPA groups -> the 5 request tabs (hotel side vs deck vs engine).
  if (["provisions", "welfare", "cloth-linen", "galley", "clothing", "lavatory", "cleaning", "medicine"].includes(c)) return "galley";
  if (c === "stationery") return "stationery";
  if (["petroleum", "pneumatic-tools", "electrical", "machinery"].includes(c)) return "spare-engine";
  if (["rope", "rigging-deck", "paint", "painting", "safety-gear", "safety", "hose", "nautical", "hardware", "brushes", "metal", "screws", "pipes", "pipe-fittings", "valves", "bearings", "packing", "welding", "hand-tools", "cutting", "measuring"].includes(c)) return "spare-deck";
  return "other";
}

export default function RequestsPage() {
  useDocTitle("req.title");
  const { t } = useLocale();
  const [contractId, setContractId] = useState<string | null>(null);
  const all = useLiveQuery(
    () => (contractId ? db.requests.where("contractId").equals(contractId).toArray() : Promise.resolve([] as StoreRequest[])),
    [contractId]
  );
  const catalogue = useLiveQuery(() => db.catalogue.toArray(), []);
  const saved = useLiveQuery(
    () => (contractId ? db.savedLists.where("contractId").equals(contractId).toArray() : Promise.resolve([] as SavedList[])),
    [contractId]
  );
  const [tab, setTab] = useState<Scope>("all");
  const [item, setItem] = useState("");
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [seeding, setSeeding] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [viewSaved, setViewSaved] = useState<string | null>(null);
  const [editSaved, setEditSaved] = useState<string | null>(null);
  const [browse, setBrowse] = useState("");
  const [qtyBy, setQtyBy] = useState<Record<string, string>>({});
  const [popup, setPopup] = useState<CatalogueItem | null>(null);
  const [popupQty, setPopupQty] = useState("");

  useEffect(() => { setContractId(getActiveContractId()); }, []);
  useEffect(() => {
    async function seed() {
      try {
        const v = localStorage.getItem("oa-impa-v");
        if (v === "7" && (await db.catalogue.count()) > 0) return;
        setSeeding(t("req.loadingCat"));
        const text = await fetch("/impa.csv").then((r) => { if (!r.ok) throw 0; return r.text(); });
        await db.catalogue.clear();
        const n = await importCatalogue(parseCatalogueCSV(text));
        localStorage.setItem("oa-impa-v", "7");
        setSeeding(n ? t("req.loadedN").replace("{n}", String(n)) : "");
      } catch { setSeeding(""); }
    }
    seed();
  }, []);

  const inScope = useMemo(() => (all ?? []).filter((r) => (tab === "all" ? true : r.tab === tab)), [all, tab]);
  const list = useMemo(() => inScope.slice().reverse(), [inScope]);
  const catPool = useMemo(() => (catalogue ?? []).filter((c) => (tab === "all" ? true : normCat(c.category) === tab)), [catalogue, tab]);
  const browsed = useMemo(() => {
    const q = browse.trim().toLowerCase();
    const pool = q ? catPool.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : catPool;
    return pool.slice(0, 150);
  }, [catPool, browse]);
  const catTotal = useMemo(() => {
    const q = browse.trim().toLowerCase();
    return q ? catPool.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).length : catPool.length;
  }, [catPool, browse]);

  async function add() {
    if (!item.trim() || !contractId) return;
    const target: RequestTab = tab === "all" ? "other" : tab;
    await db.requests.add({ id: uid("r"), tab: target, item: item.trim(), code: code.trim(), quantity: qty.trim() || "0", unit, status: "draft", note: "", updatedAt: new Date().toISOString(), contractId });
    await learnFromHistory(item, code, unit, target);
    setItem(""); setCode(""); setQty(""); setBrowse("");
  }

  async function addFromCatalogue(c: CatalogueItem, q?: string) {
    if (!contractId) return;
    const qty = (q ?? qtyBy[c.code] ?? "").trim() || "0";
    const target = normCat(c.category);
    await db.requests.add({ id: uid("r"), tab: target, item: c.name, code: c.code, quantity: qty, unit: c.unit || "pcs", status: "draft", note: "", updatedAt: new Date().toISOString(), contractId });
    setQtyBy((m) => ({ ...m, [c.code]: "" }));
    setPopup(null);
  }

  function listText(rows: { item: string; code?: string; quantity: string; unit: string }[], title: string) {
    return [`${title} — ${new Date().toLocaleDateString("en-GB")}`, ...rows.map((r) => `• ${r.item}${r.code ? ` [${r.code}]` : ""} — ${r.quantity} ${r.unit}`)].join("\n");
  }

  async function shareText(text: string, title: string) {
    try {
      if (navigator.share) { await navigator.share({ title, text }); return; }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert(t("req.copied"));
      } catch { alert(t("common.noShare")); }
    }
  }

  const shareList = () => {
    const title = t("req.listTitle").replace("{t}", tab);
    return shareText(listText(list, title), title);
  };

  async function shareListSaved(s: SavedList) {
    await shareText(listText(s.items, `${s.name} (${s.scope})`), s.name);
  }

  async function saveList() {
    const name = prompt(t("req.namePrompt"));
    if (!name?.trim() || !contractId) return;
    const items: SavedListItem[] = list.map((r) => ({ item: r.item, code: r.code ?? "", quantity: r.quantity, unit: r.unit }));
    await db.savedLists.add({ id: uid("sl"), contractId, name: name.trim(), scope: tab, items, createdAt: new Date().toISOString() });
  }

  async function editSavedQty(s: SavedList, index: number, qty: string) {
    const items = s.items.map((it, i) => (i === index ? { ...it, quantity: qty } : it));
    await db.savedLists.update(s.id, { items });
  }

  async function editSavedDelete(s: SavedList, index: number) {
    await db.savedLists.update(s.id, { items: s.items.filter((_, i) => i !== index) });
  }

  async function loadAsTemplate(s: SavedList) {
    if (!contractId) return;
    if (list.length > 0 && !confirm(t("req.confirmTop"))) return;
    const now = new Date().toISOString();
    const targetTab: RequestTab = (TAB_IDS as string[]).includes(s.scope) && s.scope !== "all" ? (s.scope as RequestTab) : "other";
    for (const it of s.items) {
      await db.requests.add({ id: uid("r"), tab: targetTab, item: it.item, code: it.code, quantity: it.quantity, unit: it.unit, status: "draft", note: `from: ${s.name}`, updatedAt: now, contractId });
    }
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("req.title")}</h1>
        <p className="text-sm">{t("req.needVessel")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t("req.titleVessel")}</h1>
          <p className="text-sm font-medium opacity-70">{t("req.sub")}{seeding ? ` ${seeding}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => all && exportJSON(`requests-${contractId}.json`, all)} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">{t("common.export")}</button>
          <button onClick={shareList} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
          <button onClick={() => window.print()} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
          <button onClick={saveList} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">{t("req.saveList")}</button>
          <button onClick={() => setShowSaved(!showSaved)} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">{t("req.savedN").replace("{n}", String((saved ?? []).length))}</button>
        </div>
      </div>

      {showSaved && (
        <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 p-4 text-sm dark:border-red-900 dark:bg-red-950/10">
          <h2 className="font-bold">{t("req.savedHint")}</h2>
          {(saved ?? []).length === 0 && <p className="mt-1 opacity-70">{t("req.noSaved")}</p>}
          <div className="mt-2 grid gap-1">
            {(saved ?? []).slice().reverse().map((s) => (
              <div key={s.id} className="rounded-xl bg-white/80 p-2 dark:bg-black">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="flex-1">{s.name} <span className="font-normal opacity-60">({s.items.length} items • {s.scope} • {s.createdAt.slice(0, 10)})</span></strong>
                  <button onClick={() => setViewSaved(viewSaved === s.id ? null : s.id)} className="rounded-full border px-2.5 py-1 text-xs font-bold">{viewSaved === s.id ? t("req.hide") : t("req.view")}</button>
                  <button onClick={() => setEditSaved(editSaved === s.id ? null : s.id)} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${editSaved === s.id ? "bg-amber-300" : ""}`}>{t("common.edit")}</button>
                  <button onClick={() => shareListSaved(s)} className="rounded-full border px-2.5 py-1 text-xs font-bold">📤</button>
                  <button onClick={() => loadAsTemplate(s)} className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("req.useTemplate")}</button>
                  <button onClick={() => db.savedLists.delete(s.id)} className="text-xs font-bold text-red-600">✕</button>
                </div>
                {(viewSaved === s.id || editSaved === s.id) && (
                  <ul className="mt-1 grid gap-0.5 text-xs">
                    {s.items.map((it, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="flex-1">• {it.item}{it.code ? ` [${it.code}]` : ""}</span>
                        {editSaved === s.id ? (
                          <>
                            <input value={it.quantity} onChange={(e) => editSavedQty(s, i, e.target.value)} inputMode="decimal" className="w-16 rounded-lg border px-1.5 py-0.5 text-right" />
                            <span className="opacity-60">{it.unit}</span>
                            <button onClick={() => editSavedDelete(s, i)} className="font-bold text-red-600">✕</button>
                          </>
                        ) : (
                          <span>— {it.quantity} {it.unit}</span>
                        )}
                      </li>
                    ))}
                    {s.items.length === 0 && <li className="opacity-60">{t("req.emptyList")}</li>}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((id) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${tab === id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "bg-white border dark:bg-black"}`}>{t(tabKey(id))}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <div className="flex flex-wrap gap-2 text-sm">
          <input value={item} onChange={(e) => { setItem(e.target.value); setBrowse(e.target.value); }} placeholder={t("req.filterPh")} className="min-w-40 flex-1 rounded-xl border px-3 py-2" />
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("req.impaPh")} className="w-24 rounded-xl border px-3 py-2 font-mono" />
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder={t("req.qtyPh")} inputMode="decimal" className="w-24 rounded-xl border px-3 py-2" />
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={t("req.unitPh")} className="w-24 rounded-xl border px-3 py-2" />
          <button onClick={add} className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("common.add")}</button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950">
          <div className="flex items-center gap-2">
            <h2 className="font-black">{t("req.catalogue").replace("{x}", tab === "all" ? t("req.catalogueAll") : `(${catTotal})`)}</h2>
            {browse && <button onClick={() => { setBrowse(""); setItem(""); }} className="ml-auto rounded-full border px-2 py-0.5 text-xs font-bold">{t("req.clearQ").replace("{q}", browse)}</button>}
          </div>
          <p className="text-[11px] opacity-60">{t("req.showing").replace("{s}", String(browsed.length)).replace("{t}", String(catTotal))}</p>
          <ul className="mt-1 grid max-h-96 gap-1 overflow-y-auto pr-1 text-sm">
            {browsed.map((c) => (
              <li key={c.code}>
                <button onClick={() => { setPopup(c); setPopupQty(""); }} className="flex w-full items-center gap-1.5 rounded-xl bg-amber-50/60 px-2 py-1.5 text-left hover:ring-2 hover:ring-amber-400 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <span className="rounded bg-stone-900 px-1 py-0.5 font-mono text-[10px] text-amber-50 dark:bg-red-700">{c.code}</span>
                  <span className="min-w-0 flex-1 truncate" title={c.name}>{c.name}</span>
                  <span className="text-xs opacity-60">{c.unit}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-black">{t("req.myList").replace("{n}", String(list.length))}</h2>
          <div className="mt-1 grid max-h-96 gap-1.5 overflow-y-auto pr-1">
            {list.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-1.5 rounded-xl bg-amber-50/60 p-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950">
                {r.code && <span className="rounded bg-stone-900 px-1 py-0.5 font-mono text-[10px] text-amber-50 dark:bg-red-700">{r.code}</span>}
                <strong className="min-w-24 flex-1">{r.item}</strong>
                <input value={r.quantity} onChange={(e) => db.requests.update(r.id, { quantity: e.target.value })} inputMode="decimal" title={t("req.qtyTitle")} className="w-16 rounded-lg border px-1.5 py-0.5 text-right text-xs" />
                <span className="text-xs opacity-60">{r.unit}</span>
                <button onClick={() => db.requests.delete(r.id)} className="text-xs font-bold text-red-600">✕</button>
              </div>
            ))}
            {list.length === 0 && <p className="text-xs opacity-70">{t("req.emptyAdd")}</p>}
          </div>
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPopup(null)}>
          <div className="w-full max-w-md rounded-3xl border-4 border-amber-700 bg-[#fffdf8] p-5 shadow-2xl dark:border-red-900 dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <span className="rounded bg-stone-900 px-2 py-0.5 font-mono text-xs text-amber-50 dark:bg-red-700">{popup.code}</span>
            <h3 className="mt-2 font-serif text-xl font-black">{popup.name}</h3>
            <p className="mt-1 text-sm opacity-70">{t("req.unitN").replace("{u}", popup.unit || "pcs")}</p>
            <div className="mt-3 flex items-center gap-2">
              <input value={popupQty} onChange={(e) => setPopupQty(e.target.value)} placeholder={t("req.qtyPh")} inputMode="decimal" autoFocus className="w-28 rounded-xl border px-3 py-2 text-center font-black" />
              <button onClick={() => addFromCatalogue(popup, popupQty)} className="flex-1 rounded-full bg-stone-900 px-4 py-2.5 font-black text-amber-50 dark:bg-red-700 dark:text-white">{t("req.addToList")}</button>
            </div>
            <button onClick={() => setPopup(null)} className="mt-2 w-full rounded-full border px-4 py-1.5 text-sm font-bold">{t("common.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
