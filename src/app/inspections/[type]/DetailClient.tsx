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

const CardRow = memo(function CardRow({ card, done, completedAt, onToggle }: {
  card: CheckCard; done: boolean; completedAt?: string; onToggle: (id: string) => void;
}) {
  return (
    <div>
      <CheckCardItem card={card} done={done} onToggle={() => onToggle(card.id)} />
      {done && completedAt && <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-red-300">Completed: {new Date(completedAt).toLocaleString()} • archived under this contract</p>}
    </div>
  );
});

export default function DetailClient({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const info = INSPECTION_TYPES.find((t) => t.id === type);
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
  const flagCards = isFlagPage && vesselFlag ? SEED_CARDS.filter((c) => c.inspection === "flag" && c.flags?.includes(vesselFlag)) : [];
  // Workplace areas: bridge (navigation/comms) vs cargo-deck vs engine.
  const inArea = (c: (typeof SEED_CARDS)[number]) => {
    if (dept === "all") return true;
    const area = areaOf(c);
    if (dept === "engine") return area === "engine" || c.department === "both";
    return area === dept;
  };
  const cards = SEED_CARDS.filter((c) => c.inspection === type)
    .filter(inArea)
    .filter((c) => {
      if (!isFlagPage || flagScope === "all") return true;
      const isFlagCard = (c.flags?.length ?? 0) > 0;
      if (flagScope === "general") return !isFlagCard;
      return !!vesselFlag && (c.flags?.includes(vesselFlag) ?? false);
    });

  if (!info) return <p>Unknown inspection type.</p>;

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
    if (!confirm(`Clear ${doneCards.length} completed card${doneCards.length > 1 ? "s" : ""} in this inspection?`)) return;
    const marks: Record<string, boolean> = {};
    doneCards.forEach((c) => { marks[c.id] = false; });
    setPending((p) => ({ ...p, ...marks }));
    await db.progress.bulkDelete(doneCards.map((c) => progressId(contractId!, c.id)));
  }

  const toggle = useCallback(async (cardId: string) => {
    if (!contractId) { alert("Select a contract first"); return; }
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
        <p className="text-sm">Select a contract first — each vessel keeps its own dated check-card history.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{info.name}</h1>
        <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">{info.description}</p>
        <p className="mt-1 text-sm">Progress (this contract): <strong>{doneCount}/{cards.length}</strong> ({cards.length ? Math.round((doneCount / cards.length) * 100) : 0}%)</p>
        {isFlagPage && (
          vesselFlag ? (
            <p className="mt-1 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-bold dark:bg-red-950">
              ⚑ Vessel flag: {flagName(vesselFlag)}{flagCards.length > 0 ? ` — ${flagCards.length} ${flagName(vesselFlag)}-specific cards below` : " — no flag-specific cards yet, showing general set"}
            </p>
          ) : (
            <p className="mt-1 text-sm font-bold opacity-70">⚑ No flag set on this contract — <Link href="/contracts" className="underline">set it in Contracts</Link> to unlock flag-specific cards.</p>
          )
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          {(["all", "bridge", "deck", "engine", "safety"] as const).map((d) => (
            <button key={d} onClick={() => setDept(d)} className={`rounded-full px-3 py-1.5 font-bold capitalize ${dept === d ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>{d === "deck" ? "Cargo · Deck" : d === "bridge" ? "Bridge" : d === "safety" ? "Safety" : d}</button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
          {(["all", "done", "todo"] as const).map((s) => (
            <button key={s} onClick={() => setShow(s)} className={`rounded-full px-3 py-1.5 font-bold ${show === s ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>
              {s === "all" ? "All" : s === "done" ? "✓ Done" : "○ To do"}
            </button>
          ))}
        </div>
        {isFlagPage && vesselFlag && flagCards.length > 0 && (
          <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
            {(["all", "general", "flag"] as const).map((s) => (
              <button key={s} onClick={() => setFlagScope(s)} className={`rounded-full px-3 py-1.5 font-bold ${flagScope === s ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>
                {s === "all" ? "All cards" : s === "general" ? "General" : `⚑ ${flagName(vesselFlag)}`}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => exportJSON(`${type}-${contractId}-progress.json`, progress)} className="rounded-full border bg-white px-3 py-1.5 dark:bg-black">Export history</button>
        <button onClick={clearAll} className="rounded-full border border-red-300 bg-white px-3 py-1.5 font-bold text-red-600 dark:border-red-900 dark:bg-black">Clear all</button>
      </div>
      <div className="grid gap-3">
        {visible.map((c) => (
          <CardRow key={c.id} card={c} done={isDone(c.id)} completedAt={doneMap.get(c.id)} onToggle={toggle} />
        ))}
        {visible.length === 0 && <p className="text-sm">No cards match this filter.</p>}
      </div>
    </div>
  );
}
