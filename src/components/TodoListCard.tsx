"use client";
import { useState } from "react";
import { db, uid } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { periodKeyFor, logId, useTodoLib, loadLib } from "@/lib/todos";
import { RANKS } from "@/lib/types";
import type { TodoList, TodoTask } from "@/lib/types";
import MedsBlock from "@/components/MedsBlock";
import { useLocale } from "@/lib/i18n";

export function rankLabel(ranks?: string[]) {
  if (!ranks || ranks.length === 0) return "all ranks";
  if (ranks.length > 3) return `${ranks.length} ranks`;
  return ranks.join(", ");
}

export function toggleRank(list: string[], r: string) {
  return list.includes(r) ? list.filter((x) => x !== r) : [...list, r];
}

export function matchesRank(ranks: string[] | undefined, rank: string) {
  return rank === "all" || !ranks || ranks.length === 0 || ranks.includes(rank);
}

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export function ListCard({ list, tasks, doneSet }: { list: TodoList; tasks: TodoTask[]; doneSet: Set<string> }) {
  const { t } = useLocale();
  const { lib, update } = useTodoLib();
  const [title, setTitle] = useState("");
  const [ranks, setRanks] = useState<string[]>([]);
  const [showTpl, setShowTpl] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRanks, setEditRanks] = useState<string[]>([]);
  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);
  const [note, setNote] = useState(list.note ?? "");
  const [medsOpen, setMedsOpen] = useState(false);
  const meds = useLiveQuery(() => db.meds.toArray(), []);

  const doneCount = tasks.filter((t) => t.active !== false && doneSet.has(logId(t.id, periodKeyFor(list.interval)))).length;
  const visible = tasks.filter((t) => t.active !== false);
  const hiddenTasks = tasks.filter((t) => t.active === false);
  const libTasks = lib[list.interval] ?? [];
  const tplOn = (titleV: string) => tasks.some((t) => t.title === titleV && t.active !== false);

  function libAdd(titleV: string, ranksV: string[]) {
    const fresh = loadLib();
    const cur = fresh[list.interval] ?? [];
    if (cur.some((x) => x.title === titleV)) return;
    update({ ...fresh, [list.interval]: [...cur, { title: titleV, ranks: ranksV }] });
  }

  function libRemove(titleV: string) {
    const fresh = loadLib();
    update({ ...fresh, [list.interval]: (fresh[list.interval] ?? []).filter((x) => x.title !== titleV) });
  }

  async function setTpl(entry: { title: string; ranks: string[] }, on: boolean) {
    if (on) {
      const matches = tasks.filter((t) => t.title === entry.title);
      for (const t of matches) {
        if (t.active === false) {
          await db.todos.update(t.id, { active: true, updatedAt: new Date().toISOString() });
        }
      }
      if (matches.length === 0) {
        await addTask(entry.title, entry.ranks);
      } else {
        libAdd(entry.title, entry.ranks);
      }
    } else {
      for (const t of tasks.filter((t) => t.title === entry.title)) {
        await db.todos.update(t.id, { active: false, updatedAt: new Date().toISOString() });
      }
      libRemove(entry.title);
    }
  }

  async function toggle(t: TodoTask) {
    const key = periodKeyFor(list.interval);
    const id = logId(t.id, key);
    const existing = await db.todoLogs.get(id);
    if (existing) await db.todoLogs.delete(id);
    else await db.todoLogs.put({ id, taskId: t.id, contractId: list.contractId, periodKey: key, completedAt: new Date().toISOString() });
  }

  async function toggleActive(t: TodoTask) {
    await db.todos.update(t.id, { active: t.active === false, updatedAt: new Date().toISOString() });
  }

  async function addTask(presetTitle?: string, presetRanks?: string[]) {
    const titleV = (presetTitle ?? title).trim();
    if (!titleV) return;
    const ranksV = presetRanks ?? ranks;
    if (!tasks.some((t) => t.title === titleV)) {
      await db.todos.add({ id: uid("todo"), contractId: list.contractId, listId: list.id, title: titleV, interval: list.interval, ranks: ranksV, active: true, custom: !presetTitle, updatedAt: new Date().toISOString() });
    }
    libAdd(titleV, ranksV);
    setTitle(""); setRanks([]);
  }

  async function removeTask(t: TodoTask) {
    await db.todos.update(t.id, { active: false, updatedAt: new Date().toISOString() });
    libRemove(t.title);
  }

  async function saveEdit(t: TodoTask) {
    if (!editText.trim()) return;
    const fresh = loadLib();
    const cur = fresh[list.interval] ?? [];
    const ix = cur.findIndex((x) => x.title === t.title);
    const nextEntry = { title: editText.trim(), ranks: editRanks };
    if (ix >= 0) {
      const copy = cur.slice();
      copy[ix] = nextEntry;
      update({ ...fresh, [list.interval]: copy });
    } else {
      update({ ...fresh, [list.interval]: [...cur, nextEntry] });
    }
    await db.todos.update(t.id, { title: editText.trim(), ranks: editRanks, updatedAt: new Date().toISOString() });
    setEditing(null);
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <div className="flex flex-wrap items-center gap-2">
        {editName ? (
          <>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="min-w-40 flex-1 rounded-xl border px-2 py-1 font-bold" />
            <button onClick={() => { if (nameDraft.trim()) db.todoLists.update(list.id, { name: nameDraft.trim() }); setEditName(false); }} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50">{t("common.save")}</button>
          </>
        ) : (
          <>
            <strong className="text-base">{list.name}</strong>
            <button onClick={() => { setNameDraft(list.name); setEditName(true); }} className="text-xs opacity-60" title={t("td.rename")}>✏️</button>
          </>
        )}
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold dark:bg-red-950 dark:text-red-200">{list.interval === "once" ? t("td.joining") : list.interval}</span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold dark:bg-red-950 dark:text-red-200">👤 {rankLabel(list.ranks)}</span>
        <span className="ml-auto text-xs font-bold">{t("td.done").replace("{d}", String(doneCount)).replace("{t}", String(visible.length))}</span>
        <button onClick={() => db.todoLists.update(list.id, { archived: true })} title="Archive list" className="rounded-full border px-2.5 py-1 text-xs">{t("td.archive")}</button>
      </div>

      <ul className="mt-2 grid gap-1 text-sm">
        {visible.map((task) => {
          const done = doneSet.has(logId(task.id, periodKeyFor(list.interval)));
          return (
            <li key={task.id}>
              {editing === task.id ? (
                <div className="grid gap-1 rounded-lg bg-amber-50 p-2 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} className="rounded-xl border px-2 py-1" />
                  <div className="flex flex-wrap gap-1 text-xs">
                    {RANKS.map((r) => (
                      <button key={r} onClick={() => setEditRanks(toggleRank(editRanks, r))} className={`rounded-full border px-2 py-0.5 ${editRanks.includes(r) ? "bg-stone-900 text-amber-50" : "bg-white dark:bg-black"}`}>{r}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => saveEdit(task)} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50">{t("common.save")}</button>
                    <button onClick={() => setEditing(null)} className="rounded-full border px-3 py-1 text-xs">{t("common.cancel")}</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <label className="flex flex-1 items-start gap-2">
                    <input type="checkbox" checked={done} onChange={() => toggle(task)} className="mt-1 h-4 w-4" />
                    <span className={`flex-1 ${done ? "line-through opacity-60" : "font-medium"}`}>{task.title}</span>
                  </label>
                  {(task.ranks?.length ?? 0) > 0 && <span className="self-center text-[11px] opacity-60">{rankLabel(task.ranks)}</span>}
                  <span className="self-center" title={t("td.onoff")}><Switch on={task.active !== false} onToggle={() => toggleActive(task)} label={`Toggle ${task.title}`} /></span>
                  <button onClick={() => { setEditing(task.id); setEditText(task.title); setEditRanks(task.ranks ?? []); }} className="self-center rounded-full border px-2 py-0.5 text-xs font-bold">{t("common.edit")}</button>
                  <button onClick={() => removeTask(task)} className="self-center rounded-full border px-2 py-0.5 text-xs">{t("route.remove")}</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {hiddenTasks.length > 0 && (
        <div className="mt-2 rounded-xl border border-dashed border-amber-300 p-2 dark:border-red-900">
          <p className="text-xs font-bold opacity-70">{t("td.switchedoff").replace("{x}", String(hiddenTasks.length))}</p>
          <div className="mt-1 grid gap-1 text-sm">
            {hiddenTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded-lg px-2 py-1 opacity-70">
                <Switch on={false} onToggle={() => toggleActive(task)} label={`Re-enable ${task.title}`} />
                <span className="flex-1">{task.title}</span>
                <button onClick={() => removeTask(task)} className="rounded-full border px-2 py-0.5 text-xs">{t("route.remove")}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {list.interval === "once" && (
        <div className="mt-2 overflow-hidden rounded-xl border border-amber-200 dark:border-red-900">
          <button onClick={() => setMedsOpen(!medsOpen)} className="flex w-full items-center gap-2 bg-amber-50 px-3 py-2 text-sm font-bold dark:bg-black">
            <span>{t("td.meds")}</span>
            <span className="text-xs opacity-60">
              {t("td.packed").replace("{p}", String((meds ?? []).filter((m) => m.packed).length)).replace("{t}", String((meds ?? []).length))}
            </span>
            <span className="ml-auto">{medsOpen ? "▴" : "▾"}</span>
          </button>
          {medsOpen && (
            <div className="p-2">
              <MedsBlock />
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5 text-sm">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("td.newCheck")} className="min-w-32 flex-1 rounded-xl border px-2 py-1" />
        <button onClick={() => addTask()} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("common.add")}</button>
        <button onClick={() => setShowTpl(!showTpl)} className="rounded-full border px-3 py-1 text-xs font-bold">{t("td.templates").replace("{x}", String(libTasks.length))}</button>
      </div>
      {title.trim() && (
        <div className="mt-1 flex flex-wrap gap-1 text-xs">
          <span className="self-center font-bold opacity-60">{t("td.ranks")}</span>
          {RANKS.map((r) => (
            <button key={r} onClick={() => setRanks(toggleRank(ranks, r))} className={`rounded-full border px-2 py-0.5 ${ranks.includes(r) ? "bg-stone-900 text-amber-50" : "bg-white dark:bg-black"}`}>{r}</button>
          ))}
        </div>
      )}
      {showTpl && (
        <div className="mt-1 grid gap-1 text-sm">
          {libTasks.map((p) => {
            const on = tplOn(p.title);
            return (
              <div key={`${list.interval}-${p.title}`} className="flex items-center gap-2 rounded-xl bg-white/70 px-2 py-1 dark:bg-black">
                <Switch on={on} onToggle={() => setTpl(p, !on)} label={p.title} />
                <span className={`flex-1 ${on ? "font-medium" : "opacity-70"}`}>{p.title} <span className="text-xs opacity-60">({rankLabel(p.ranks)})</span></span>
              </div>
            );
          })}
          {libTasks.length === 0 && <p className="text-xs opacity-60">{t("td.libEmpty")}</p>}
        </div>
      )}

      <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => db.todoLists.update(list.id, { note })} placeholder={t("td.notePh")} rows={1} className="mt-2 w-full rounded-xl border px-2 py-1 text-xs opacity-80" />
    </div>
  );
}

export function ArchivedTodoLists({ lists, tasks }: { lists: TodoList[]; tasks: TodoTask[] }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  if (!lists.length) return null;
  return (
    <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 p-3 text-sm dark:border-red-900 dark:bg-red-950/10">
      <button onClick={() => setOpen(!open)} className="font-black">{t("td.archived").replace("{n}", String(lists.length))} {open ? "▴" : "▾"}</button>
      {open && (
        <div className="mt-2 grid gap-2">
          {lists.map((l) => {
            const lt = tasks.filter((t) => t.listId === l.id);
            return (
              <div key={l.id} className="rounded-xl bg-white/70 p-2 dark:bg-black">
                <div className="flex items-center gap-2">
                  <strong className="flex-1">{l.name} <span className="font-normal opacity-60">({l.interval} • {lt.length} checks)</span></strong>
                  <button onClick={() => db.todoLists.update(l.id, { archived: false })} className="rounded-full border px-2.5 py-1 text-xs font-bold">{t("td.restore")}</button>
                  <button onClick={async () => { if (confirm(t("td.confirmDel").replace("{x}", l.name))) { await db.todos.where("listId").equals(l.id).delete(); await db.todoLists.delete(l.id); } }} className="text-xs font-bold text-red-600">{t("common.delete")}</button>
                </div>
              </div>
            );
          })}
          <p className="text-xs opacity-60">{t("td.histHint")}</p>
        </div>
      )}
    </div>
  );
}
