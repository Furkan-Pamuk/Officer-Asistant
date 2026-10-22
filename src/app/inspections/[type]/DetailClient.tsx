"use client";
import { memo, use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db, seedChecklistsIfEmpty, exportJSON, getActiveContractId, progressId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { INSPECTION_TYPES, SEED_CARDS } from "@/lib/data";
import CheckCardItem from "@/components/CheckCardItem";
import { flagName } from "@/lib/flags";
import { areaOf } from "@/lib/areas";
import type { CheckCard } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";

const CardRow = memo(function CardRow({ card, done, completedAt, onToggle }: {
  card: CheckCard; done: boolean; completedAt?: string; onToggle: (id: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div>
      <CheckCardItem card={card} done={done} onToggle={() => onToggle(card.id)} />
      {done && completedAt && <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-red-300">{t("insp.doneOn").replace("{d}", new Date(completedAt).toLocaleString())}</p>}
    </div>
  );
});

export default function DetailClient({ params }: { params: Promise<{ type: string }> }) {
  const { t } = useLocale();
  const o = useContentOverlay();
  const { type } = use(params);
  const infoBase = INSPECTION_TYPES.find((t) => t.id === type);
  const info = infoBase ? withOv(infoBase, cov(o, "inspTypes", infoBase.id)) : undefined;
  const [dept, setDept] = useState<"all" | "bridge" | "deck" | "engine" | "safety">("all");
  const [show, setShow] = useState<"all" | "done" | "todo">("all");
  const [contractId, setContractId] = useState<string | null>(null);
  const [vesselFlag, setVesselFlag] = useState("");
  const [flagScope, setFlagScope] = useState<"all" | "general" | "flag">("all");
  const progress = useLiveQuery(
    () => (contractId ? db.progress.where("contractId").equals(contractId).toArray() : Promise.resolve([])),
    [contractId]
  );

  useEffect(() => {
    const id = getActiveContractId();
    setContractId(id);
    if (id) db.contracts.get(id).then((c) => setVesselFlag(c?.flag ?? ""));
    seedChecklistsIfEmpty();
  }, []);

  const doneMap = useMemo(() => new Map((progress ?? []).map((p) => [p.cardId, p.completedAt])), [progress]);
  const isFlagPage = type === "flag";
  const allCards = SEED_CARDS.map((c) => withOv(c, cov(o, "cards", c.id)));
  const flagCards = isFlagPage && vesselFlag ? allCards.filter((c) => c.inspection === "flag" && c.flags?.includes(vesselFlag)) : [];
  // Workplace areas: bridge (navigation/comms) vs cargo-deck vs engine.
  const inArea = (c: (typeof SEED_CARDS)[number]) => {
    if (dept === "all") return true;
    const area = areaOf(c);
    if (dept === "engine") return area === "engine" || c.department === "both";
    return area === dept;
  };
  const cards = allCards.filter((c) => c.inspection === type)
    .filter(inArea)
    .filter((c) => {
      if (!isFlagPage || flagScope === "all") return true;
      const isFlagCard = (c.flags?.length ?? 0) > 0;
      if (flagScope === "general") return !isFlagCard;
      return !!vesselFlag && (c.flags?.includes(vesselFlag) ?? false);
    });

  if (!info) return <p>{t("insp.unknown")}</p>;

  // Optimistic ticks: instant UI, Dexie write in background, live query confirms.
  const [pending, setPending] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setPending((prev) => {
      const keys = Object.keys(prev);
      if (!keys.length) return prev;
      const next = { ...prev };
      let changed = false;
      for (const k of keys) {
        if (doneMap.has(k) === prev[k]) { delete next[k]; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [doneMap]);
  const isDone = useCallback((id: string) => (id in pending ? pending[id] : doneMap.has(id)), [pending, doneMap]);

  const doneCount = cards.filter((c) => isDone(c.id)).length;

  async function clearAll() {
    const doneCards = cards.filter((c) => isDone(c.id));
    if (!doneCards.length) return;
    if (!confirm(t("insp.confirmClear").replace("{n}", String(doneCards.length)))) return;
    const marks: Record<string, boolean> = {};
    doneCards.forEach((c) => { marks[c.id] = false; });
    setPending((p) => ({ ...p, ...marks }));
    await db.progress.bulkDelete(doneCards.map((c) => progressId(contractId!, c.id)));
  }

  const toggle = useCallback(async (cardId: string) => {
    if (!contractId) { alert(t("common.needContract")); return; }
    const id = progressId(contractId, cardId);
    const next = !(cardId in pending ? pending[cardId] : doneMap.has(cardId));
    setPending((p) => ({ ...p, [cardId]: next }));
    try {
      if (next) {
        const now = new Date().toISOString();
        await db.progress.put({ id, contractId, cardId, status: "done", completedAt: now, updatedAt: now });
      } else {
        await db.progress.delete(id);
      }
    } catch {
      setPending((p) => { const n = { ...p }; delete n[cardId]; return n; });
    }
  }, [contractId, pending, doneMap]);

  const visible = show === "done" ? cards.filter((c) => isDone(c.id)) : show === "todo" ? cards.filter((c) => !isDone(c.id)) : cards;

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{info.name}</h1>
        <p className="text-sm">{t("insp.needVessel")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{info.name}</h1>
        <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">{info.description}</p>
        <p className="mt-1 text-sm">{t("insp.progress").replace("{d}", String(doneCount)).replace("{t}", String(cards.length)).replace("{p}", String(cards.length ? Math.round((doneCount / cards.length) * 100) : 0))}</p>
        {isFlagPage && (
          vesselFlag ? (
            <p className="mt-1 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-bold dark:bg-red-950">
              {flagCards.length > 0 ? t("insp.flagN").replace("{f}", flagName(vesselFlag)).replace("{n}", String(flagCards.length)).replace("{f2}", flagName(vesselFlag)) : t("insp.flagN").replace("{f}", flagName(vesselFlag)).replace("{n}", "0").replace("{f2}", flagName(vesselFlag)) + t("insp.noFlagCards")}
            </p>
          ) : (
            <p className="mt-1 text-sm font-bold opacity-70">{t("insp.noFlag")} <Link href="/contracts" className="underline">{t("insp.setFlagLink")}</Link>{t("insp.unlockTail")}</p>
          )
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          {(["all", "bridge", "deck", "engine", "safety"] as const).map((d) => (
            <button key={d} onClick={() => setDept(d)} className={`rounded-full px-3 py-1.5 font-bold capitalize ${dept === d ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>{d === "deck" ? t("insp.deptDeck") : d === "bridge" ? t("insp.deptBridge") : d === "safety" ? t("insp.deptSafety") : d === "all" ? t("insp.deptAll") : t("insp.deptEngineLow")}</button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          {(["all", "done", "todo"] as const).map((s) => (
            <button key={s} onClick={() => setShow(s)} className={`rounded-full px-3 py-1.5 font-bold ${show === s ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>
              {s === "all" ? t("common.all") : s === "done" ? t("insp.done") : t("insp.todo")}
            </button>
          ))}
        </div>
        {isFlagPage && vesselFlag && flagCards.length > 0 && (
          <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
            {(["all", "general", "flag"] as const).map((s) => (
              <button key={s} onClick={() => setFlagScope(s)} className={`rounded-full px-3 py-1.5 font-bold ${flagScope === s ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>
                {s === "all" ? t("insp.scopeAll") : s === "general" ? t("insp.general") : t("insp.flagScope").replace("{f}", flagName(vesselFlag))}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => exportJSON(`${type}-${contractId}-progress.json`, progress)} className="rounded-full border bg-white px-3 py-1.5 dark:bg-black">{t("insp.exportHist")}</button>
        <button onClick={clearAll} className="rounded-full border border-red-300 bg-white px-3 py-1.5 font-bold text-red-600 dark:border-red-900 dark:bg-black">{t("insp.clearAll")}</button>
      </div>
      <div className="grid gap-3">
        {visible.map((c) => (
          <CardRow key={c.id} card={c} done={isDone(c.id)} completedAt={doneMap.get(c.id)} onToggle={toggle} />
        ))}
        {visible.length === 0 && <p className="text-sm">{t("insp.noMatch")}</p>}
      </div>
    </div>
  );
}
