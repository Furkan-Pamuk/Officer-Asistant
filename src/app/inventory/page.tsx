"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { useSearchParams } from "next/navigation";
import { db, getActiveContractId, uid, exportJSON } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { INVENTORY_LISTS, seedInventoryForContract } from "@/lib/inventory";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import type { InventoryListId } from "@/lib/types";

function InventoryInner() {
  useDocTitle("inv.title");
  const { t } = useLocale();
  const o = useContentOverlay();
  const listsOv = INVENTORY_LISTS.map((l) => withOv(l, cov(o, "invLists", l.id)));
  const params = useSearchParams();
  const [tab, setTab] = useState<InventoryListId>("flag");
  const [contractId, setContractId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const items = useLiveQuery(
    () => (contractId ? db.inventory.where("contractId").equals(contractId).toArray() : Promise.resolve([])),
    [contractId]
  );

  useEffect(() => {
    const q = params.get("tab") as InventoryListId | null;
    if (q && INVENTORY_LISTS.some((t) => t.id === q)) setTab(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = getActiveContractId();
    setContractId(id);
    if (id) seedInventoryForContract(id);
  }, []);

  async function addCustom() {
    if (!name.trim() || !contractId) return;
    const now = new Date().toISOString();
    await db.inventory.add({
      id: uid("inv"),
      contractId,
      list: tab,
      name: name.trim(),
      qty: "0",
      unit: "pcs",
      custom: true,
      updatedAt: now,
    });
    setName("");
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("inv.title")}</h1>
        <p className="text-sm">{t("inv.needVessel")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
      </div>
    );
  }

  const rows = (items ?? [])
    .filter((r) => r.list === tab)
    .filter((r) => (q.trim() ? r.name.toLowerCase().includes(q.trim().toLowerCase()) : true));
  const meta = listsOv.find((t) => t.id === tab)!;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t("inv.title")}</h1>
          <p className="text-sm font-medium opacity-70">{t("inv.sub")}</p>
        </div>
        <button onClick={() => exportJSON(`inventory-${contractId}.json`, { items })} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">{t("common.export")}</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {listsOv.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            title={t.hint}
            className={`rounded-full px-3 py-1.5 text-sm font-bold ${tab === t.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border bg-white dark:bg-black"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">{meta.label} <span className="font-normal opacity-60">• {meta.hint}</span></h2>
        <div className="mt-2 flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("inv.searchPh")}
            className="min-w-32 flex-1 rounded-xl border px-3 py-1.5 text-sm"
          />
          {q && (
            <button onClick={() => setQ("")} className="rounded-full border px-3 py-1.5 text-sm font-bold">✕</button>
          )}
        </div>
        <div className="mt-2 grid gap-1 text-sm">
          <div className="grid grid-cols-[1fr_84px_64px_40px] items-center gap-2 px-2 text-[11px] font-black uppercase tracking-wider opacity-60 md:grid-cols-[1fr_96px_110px_40px]">
            <span>{t("inv.hItem")}</span>
            <span>{t("inv.hQty")}</span>
            <span>{tab === "medicine" ? t("inv.hExpiry") : tab === "publications" ? t("inv.hEdition") : t("inv.hUnit")}</span>
            <span />
          </div>
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-[1fr_84px_64px_40px] items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5 md:grid-cols-[1fr_96px_110px_40px] dark:bg-black dark:ring-1 dark:ring-red-950">
              <span className="font-medium">{r.name}</span>
              <input
                value={r.qty}
                onChange={(e) => db.inventory.update(r.id, { qty: e.target.value, updatedAt: new Date().toISOString() })}
                inputMode="decimal"
                className="w-full rounded-lg border px-2 py-1 text-center font-bold"
              />
              {tab === "medicine" ? (
                <input
                  type="date"
                  value={r.expiry ?? ""}
                  onChange={(e) => db.inventory.update(r.id, { expiry: e.target.value, updatedAt: new Date().toISOString() })}
                  className="w-full rounded-lg border px-1 py-1 text-xs"
                />
              ) : tab === "publications" ? (
                <input
                  value={r.edition ?? ""}
                  onChange={(e) => db.inventory.update(r.id, { edition: e.target.value, updatedAt: new Date().toISOString() })}
                  placeholder={t("inv.edPh")}
                  className="w-full rounded-lg border px-2 py-1 text-xs"
                />
              ) : (
                <span className="text-xs opacity-60">{r.unit}</span>
              )}
              <button onClick={() => db.inventory.delete(r.id)} title={t("inv.delRow")} className="rounded-full border px-2 py-0.5 text-xs">✕</button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm opacity-70">{q.trim() ? t("inv.noMatch").replace("{q}", q.trim()) : t("inv.emptyAdd")}</p>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("inv.newItemPh")} className="min-w-32 flex-1 rounded-xl border px-3 py-1.5 text-sm" />
          <button onClick={addCustom} className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("common.add")}</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  useDocTitle("inv.title");
  const { t } = useLocale();
  return (
    <div className="shark-interior-page">
      <Suspense fallback={<p>{t("inv.loading")}</p>}>
      <InventoryInner />
    </Suspense>
    </div>
  );
}
