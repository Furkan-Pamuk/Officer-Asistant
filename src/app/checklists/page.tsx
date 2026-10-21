"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db, seedChecklistsForContract, getActiveContractId, uid, exportJSON } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { useTodoData, matchesRank } from "@/hooks/useTodoData";
import { ListCard, ArchivedTodoLists } from "@/components/TodoListCard";
import { nearestPort } from "@/lib/portlog";
import type { ChecklistGroup, Contract, JobChecklist, TodoInterval } from "@/lib/types";

type Tab = TodoInterval | ChecklistGroup;

const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "once", label: "Pre-joining" },
  { id: "bridge", label: "Bridge" },
  { id: "cargo", label: "Cargo" },
  { id: "engine", label: "Engine" },
  { id: "deck", label: "Deck" },
  { id: "safety", label: "Safety" },
];

const GROUPS: { id: ChecklistGroup; label: string }[] = [
  { id: "bridge", label: "Bridge" },
  { id: "cargo", label: "Cargo" },
  { id: "engine", label: "Engine" },
  { id: "deck", label: "Deck" },
  { id: "safety", label: "Safety" },
];

const INTERVALS: TodoInterval[] = ["daily", "weekly", "monthly", "once"];

function isIntervalTab(t: Tab): t is TodoInterval {
  return (INTERVALS as string[]).includes(t);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function autoPort(contract: Contract | null): string {
  try {
    const raw = localStorage.getItem("oa-pos");
    if (raw) {
      const p = JSON.parse(raw);
      if (isFinite(p.lat) && isFinite(p.lon)) {
        const near = nearestPort(p.lat, p.lon);
        if (near) return near.name;
      }
    }
  } catch { /* ignore */ }
  return contract?.destPort || contract?.joinPort || "";
}

// Legacy rows were seeded before groups existed — file them by department.
function groupOf(l: JobChecklist): ChecklistGroup {
  if (l.group) return l.group;
  return l.department === "engine" ? "engine" : "deck";
}

function ChecklistsInner() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>("daily");
  const [contractId, setContractId] = useState<string | null>(null);
  const { lists, tasks, doneSet, lockedRank } = useTodoData();
  const jobLists = useLiveQuery(
    () => (contractId ? db.checklists.where("contractId").equals(contractId).toArray() : Promise.resolve([] as JobChecklist[])),
    [contractId]
  );
  const [title, setTitle] = useState("");
  const [items, setItems] = useState("");
  const [group, setGroup] = useState<ChecklistGroup>("deck");
  const [query, setQuery] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const q = params.get("tab") as Tab | null;
    if (q && TABS.some((t) => t.id === q)) setTab(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = getActiveContractId();
    setContractId(id);
    if (id) {
      seedChecklistsForContract(id);
      db.contracts.get(id).then((c) => setContract(c ?? null)).catch(() => {});
    }
  }, []);

  async function addCustom() {
    if (!title.trim() || !contractId) return;
    const now = new Date().toISOString();
    const arr = items.split("\n").map((s) => s.trim()).filter(Boolean);
    const list = arr.length ? arr : ["New item"];
    await db.checklists.add({ id: uid("chk"), title: title.trim(), description: "Custom checklist", department: tab === "engine" ? "engine" : "both", group, items: list, done: list.map(() => false), custom: true, updatedAt: now, contractId });
    setTitle(""); setItems("");
  }

  async function toggle(list: JobChecklist, idx: number) {
    const done = [...list.done];
    done[idx] = !done[idx];
    await db.checklists.update(list.id, { done, updatedAt: new Date().toISOString() });
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Checklists</h1>
        <p className="text-sm">Select a contract first — checklists are kept per vessel.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  const eff = lockedRank ?? "all";
  const todoLists = lists.filter((l) => !l.archived && matchesRank(l.ranks, eff));
  const archived = lists.filter((l) => l.archived && matchesRank(l.ranks, eff));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Checklists — this vessel</h1>
          <p className="text-sm font-medium opacity-70">
            Daily / Weekly / Monthly / Pre-joining routines plus Bridge, Cargo, Engine and Deck job checklists.
            {lockedRank ? ` Showing: ${lockedRank}.` : ""}
          </p>
        </div>
        <button onClick={() => jobLists && exportJSON(`checklists-${contractId}.json`, { job: jobLists, lists, tasks })} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">Export</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${tab === t.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "bg-white border dark:bg-black"}`}>
            {t.id === "once" ? "Pre-joining" : t.label}
          </button>
        ))}
      </div>

      {isIntervalTab(tab) ? (
        <div className="grid gap-3">
          {todoLists.filter((l) => l.interval === tab).map((l) => (
            <ListCard key={l.id} list={l} tasks={tasks.filter((t) => t.listId === l.id && matchesRank(t.ranks, eff))} doneSet={doneSet} />
          ))}
          {todoLists.filter((l) => l.interval === tab).length === 0 && (
            <p className="text-sm opacity-70">No lists here — they are created automatically per interval.</p>
          )}
          <ArchivedTodoLists lists={archived.filter((l) => l.interval === tab)} tasks={tasks} />
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
            <h2 className="font-bold">Create your own ({GROUPS.find((g) => g.id === tab)?.label})</h2>
            <div className="mt-2 grid gap-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title e.g. Pre-arrival messages — Houston" className="rounded-xl border px-3 py-2 text-sm" />
              <textarea value={items} onChange={(e) => setItems(e.target.value)} placeholder={"One item per line\nSend 48h notice\n..."} rows={3} className="rounded-xl border px-3 py-2 text-sm" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold opacity-60">Group:</span>
                {GROUPS.map((g) => (
                  <button key={g.id} onClick={() => setGroup(g.id)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${group === g.id ? "bg-stone-900 text-amber-50" : "border bg-white dark:bg-black"}`}>{g.label}</button>
                ))}
                <button onClick={addCustom} className="ml-auto w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Add checklist</button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[300px_1fr]">
            <div className="md:col-span-2 lg:col-span-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Filter ${GROUPS.find((g) => g.id === tab)?.label} checklists…`}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
            {(() => {
              const q = query.trim().toLowerCase();
              const lists = (jobLists ?? []).filter((l) => groupOf(l) === tab).filter((l) => {
                if (!q) return true;
                return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.items.some((it) => it.toLowerCase().includes(q));
              });
              const sel = lists.find((l) => l.id === selId) ?? lists[0] ?? null;
              const selDone = sel ? sel.done.filter(Boolean).length : 0;
              const port = sel ? (sel.port ?? autoPort(contract)) : "";
              const date = sel ? (sel.logDate ?? todayStr()) : "";
              const time = sel ? (sel.logTime ?? nowHM()) : "";
              return (<>
                <div className="rounded-2xl border border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950">
                  <button onClick={() => setNavOpen(!navOpen)} className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold">
                    <span>☰ {GROUPS.find((g) => g.id === tab)?.label} lists ({lists.length})</span>
                    <span>{navOpen ? "▾" : "▸"}</span>
                  </button>
                  {navOpen && (
                    <ul className="grid max-h-[60vh] gap-1 overflow-y-auto px-2 pb-2">
                      {lists.map((l) => {
                        const d = l.done.filter(Boolean).length;
                        const active = sel?.id === l.id;
                        return (
                          <li key={l.id}>
                            <button
                              onClick={() => setSelId(l.id)}
                              className={`flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${active ? "bg-stone-900 font-bold text-amber-50 dark:bg-red-700 dark:text-white" : "bg-amber-50 hover:bg-amber-100 dark:bg-black dark:ring-1 dark:ring-red-950"}`}
                            >
                              <span className="min-w-0 flex-1 truncate">{l.title}</span>
                              <span className={`shrink-0 text-xs font-bold ${active ? "opacity-90" : "opacity-60"}`}>{d}/{l.items.length}</span>
                            </button>
                          </li>
                        );
                      })}
                      {lists.length === 0 && <li className="px-2 py-3 text-sm opacity-70">No checklists match.</li>}
                    </ul>
                  )}
                </div>
                {sel ? (
                  <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
                    <input value={sel.title} onChange={(e) => db.checklists.update(sel.id, { title: e.target.value })} className="w-full rounded-lg border px-2 py-1 font-bold" />
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-xl bg-amber-50 px-2 py-1.5 text-xs dark:bg-black dark:ring-1 dark:ring-red-950">
                      <span className="font-black">🚢 {contract?.shipName || "—"}</span>
                      <input value={port} onChange={(e) => db.checklists.update(sel.id, { port: e.target.value })} placeholder="Port" title="Port (auto-filled, editable)" className="w-28 rounded-lg border px-1.5 py-0.5" />
                      <input type="date" value={date} onChange={(e) => db.checklists.update(sel.id, { logDate: e.target.value })} title="Date (auto-filled, editable)" className="rounded-lg border px-1.5 py-0.5" />
                      <input type="time" value={time} onChange={(e) => db.checklists.update(sel.id, { logTime: e.target.value })} title="Time (auto-filled, editable)" className="rounded-lg border px-1.5 py-0.5" />
                    </div>
                    <p className="mt-1 text-xs opacity-70">{sel.description} • {selDone}/{sel.items.length} done {sel.custom ? "• custom" : "• template"}</p>
                    <ul className="mt-2 grid gap-1 text-sm">
                      {sel.items.map((it, i) => (
                        <li key={i}>
                          <label className="flex items-start gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                            <input type="checkbox" checked={!!sel.done[i]} onChange={() => toggle(sel, i)} className="mt-1" />
                            <span className={sel.done[i] ? "line-through opacity-60" : ""}>{it}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    {sel.custom && (
                      <div className="mt-2 flex gap-2 text-xs font-bold">
                        <button onClick={() => { db.checklists.delete(sel.id); setSelId(null); }} className="rounded-full border border-red-300 px-3 py-1 text-red-600">Delete</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-70">Select a checklist from the list.</p>
                )}
              </>);
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChecklistsPage() {
  return (
    <Suspense fallback={<p>Loading checklists…</p>}>
      <ChecklistsInner />
    </Suspense>
  );
}
