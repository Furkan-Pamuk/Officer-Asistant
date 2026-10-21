"use client";
import Dexie, { type Table } from "dexie";
import type { BellArchive, BellEntry, CatalogueItem, ContactMessage, Contract, CrewPost, CrewRow, CrewSnap, CvData, Dish, EditorQuestion, InventoryItem, JobChecklist, LogEntry, Med, MenuSnap, Note, PortDocRow, PortVhf, Profile, ProviderUsage, SavedList, StoreRequest, TodoList, TodoLog, TodoTask, VesselCache, Voyage, WaterDay, WeightEntry, WeekPlan } from "./types";
import { JOB_TEMPLATES } from "./data";

export interface ProgressRow {
  id: string; // contractId__cardId
  contractId: string;
  cardId: string;
  status: "done" | "na";
  completedAt: string;
  updatedAt: string;
}

class OfficerDB extends Dexie {
  contracts!: Table<Contract, string>;
  progress!: Table<ProgressRow, string>;
  checklists!: Table<JobChecklist, string>;
  notes!: Table<Note, string>;
  requests!: Table<StoreRequest, string>;
  questions!: Table<EditorQuestion, string>;
  todos!: Table<TodoTask, string>;
  todoLogs!: Table<TodoLog, string>;
  todoLists!: Table<TodoList, string>;
  profile!: Table<Profile, string>;
  weights!: Table<WeightEntry, string>;
  meds!: Table<Med, string>;
  catalogue!: Table<CatalogueItem, string>;
  menuPlans!: Table<WeekPlan, string>;
  dishes!: Table<Dish, string>;
  menuSnaps!: Table<MenuSnap, string>;
  water!: Table<WaterDay, string>;
  messages!: Table<ContactMessage, string>;
  crewRows!: Table<CrewRow, string>;
  savedLists!: Table<SavedList, string>;
  crewSnaps!: Table<CrewSnap, string>;
  vesselCache!: Table<VesselCache, string>;
  providerUsage!: Table<ProviderUsage, string>;
  cvdata!: Table<CvData, string>;
  logEntries!: Table<LogEntry, string>;
  portVhf!: Table<PortVhf, string>;
  voyages!: Table<Voyage, string>;
  bellLog!: Table<BellEntry, string>;
  bellArchive!: Table<BellArchive, string>;
  crewPosts!: Table<CrewPost, string>;
  inventory!: Table<InventoryItem, string>;
  portdocs!: Table<PortDocRow, string>;

  constructor() {
    // v2 database: PK change (cardId -> id) is not supported by Dexie upgrades,
    // so we use a fresh DB name instead of migrating v1 in place.
    super("officer-assistant-v2");
    this.version(1).stores({
      contracts: "id, status, updatedAt",
      progress: "id, contractId, cardId, completedAt",
      checklists: "id, contractId",
      notes: "id, contractId",
      requests: "id, contractId",
      questions: "id, contractId",
    });
    this.version(2).stores({
      todos: "id, contractId, interval, active",
      todoLogs: "id, taskId, contractId, periodKey",
    });
    this.version(3).stores({
      profile: "id",
      weights: "id, date",
      meds: "id, contractId",
      catalogue: "code, name",
    });
    this.version(4).stores({
      menuPlans: "id, contractId",
      dishes: "id, meal",
    });
    this.version(5).stores({
      water: "id",
      messages: "id, contractId",
    });
    this.version(6).stores({
      notes: "id, contractId, remindAt",
    });
    this.version(7).stores({
      crewRows: "id, [contractId+month]",
    });
    this.version(8).stores({
      savedLists: "id, contractId",
    });
    this.version(9).stores({
      logEntries: "id, contractId",
      portVhf: "portCode",
    });
    this.version(10).stores({
      voyages: "id, contractId",
    });
    this.version(11).stores({
      cvdata: "id",
    });
    this.version(12).stores({
      crewSnaps: "id, contractId",
    });
    this.version(13).stores({
      vesselCache: "imo",
      providerUsage: "id",
    });
    this.version(14).stores({
      menuSnaps: "id, contractId",
    });
    this.version(15).stores({
      todoLists: "id, contractId",
    });
    this.version(16).stores({
      todos: "id, contractId, interval, active, listId",
    });
    this.version(17).stores({
      bellLog: "id, contractId",
    });
    this.version(18).stores({
      inventory: "id, contractId",
    });
    this.version(19).stores({
      portdocs: "id, contractId, module",
    });
    this.version(20).stores({
      bellArchive: "id, contractId",
    });
    this.version(21).stores({
      crewPosts: "id, date",
    });
  }
}

export const db = new OfficerDB();

const ACTIVE_KEY = "oa-active-contract";

export function getActiveContractId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveContractId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

function checklistSeedId(contractId: string, t: { id: string }, i: number) {
  // Legacy hand-written templates keep index ids; generated SMS templates
  // use stable slug ids so fresh seeds and later merges produce identical rows.
  return t.id.startsWith("sms-") ? `${contractId}_sms_${t.id}` : `${contractId}_tpl_${i}`;
}

export async function seedChecklistsForContract(contractId: string) {
  const rows = await db.checklists.where("contractId").equals(contractId).toArray();
  const now = new Date().toISOString();
  // Templates removed from the shipped set (user request) disappear from
  // existing contracts too. Titles are matched exactly; user-renamed forks
  // (different titles) are never touched.
  const GONE = new Set([
    "E 009 Bunkering Safety Checklist",
    "E 019 Navigation in Shallow or Coastal Waters",
    "E 020 Navigation in Heavy Weather",
  ]);
  const goneIds = rows.filter((r) => GONE.has(r.title)).map((r) => r.id);
  if (goneIds.length) await db.checklists.bulkDelete(goneIds).catch(() => {});
  if (rows.length === 0) {
    // bulkPut (upsert): double-invoked seeds must not throw on key conflicts
    await db.checklists.bulkPut(
      JOB_TEMPLATES.map((t, i) => ({ ...t, id: checklistSeedId(contractId, t, i), done: t.items.map(() => false), custom: false, updatedAt: now, contractId }))
    ).catch(() => {});
    return;
  }
  await backfillChecklistGroups(contractId);
  // refresh template content when the shipped template changed (item count or
  // description differs): keep the user's ticks by index, default new rows off.
  // Rows the user renamed (title no longer matches) are treated as forks and kept.
  for (const r of rows) {
    const tpl = JOB_TEMPLATES.find((t) => t.title === r.title);
    if (!tpl) continue;
    if (tpl.items.length !== r.items.length || tpl.description !== r.description) {
      await db.checklists.update(r.id, {
        items: tpl.items,
        done: tpl.items.map((_, i) => !!r.done[i]),
        description: tpl.description,
        group: tpl.group,
        updatedAt: now,
      });
    }
  }
  // merge newly shipped templates into existing contracts (matched by title;
  // template cards have no delete button, so nothing user-removed can return)
  const have = new Set(rows.map((r) => r.title));
  const missing = JOB_TEMPLATES.filter((t) => !have.has(t.title));
  if (!missing.length) return;
  await db.checklists.bulkPut(
    missing.map((t) => ({ ...t, id: checklistSeedId(contractId, t, JOB_TEMPLATES.indexOf(t)), done: t.items.map(() => false), custom: false, updatedAt: now, contractId }))
  ).catch(() => {});
}

// Existing contracts were seeded before groups existed — file rows by template title.
export async function backfillChecklistGroups(contractId: string) {
  const rows = await db.checklists.where("contractId").equals(contractId).toArray();
  for (const r of rows) {
    if ((r as { group?: string }).group) continue;
    const tpl = JOB_TEMPLATES.find((t) => t.title === r.title);
    if (tpl) {
      await db.checklists.update(r.id, { group: tpl.group });
    }
  }
}

// Serialize seeds per contract: concurrent mounts (dashboard + checklists)
// used to read the same task list and insert the same presets twice.
const seedLocks = new Map<string, Promise<void>>();

export function seedTodosForContract(contractId: string): Promise<void> {
  const prev = seedLocks.get(contractId) ?? Promise.resolve();
  const next = prev.then(() => seedTodosInner(contractId)).catch(() => {});
  seedLocks.set(contractId, next);
  return next;
}

async function seedTodosInner(contractId: string) {
  const now = new Date().toISOString();
  const { defaultListsFor, loadLib } = await import("./todos");
  let lists = await db.todoLists.where("contractId").equals(contractId).toArray();
  if (lists.length === 0) {
    await db.todoLists.bulkPut(defaultListsFor(contractId, now)).catch(() => {});
    lists = defaultListsFor(contractId, now);
  }
  const byInterval: Record<string, string> = {};
  for (const l of lists) if (!byInterval[l.interval]) byInterval[l.interval] = l.id;
  // migrate legacy tasks without a list
  const tasks = await db.todos.where("contractId").equals(contractId).toArray();
  for (const t of tasks) {
    if (!t.listId && byInterval[t.interval]) {
      await db.todos.update(t.id, { listId: byInterval[t.interval] });
    }
  }
  // repair duplicate preset rows left by earlier concurrent seeds:
  // same interval+title, both shipped (custom rows are never touched).
  // Keeps an active row when one exists.
  {
    type Row = { id: string; interval: string; title: string; active: boolean; custom: boolean };
    const byKey = new Map<string, Row[]>();
    for (const t of tasks as Row[]) {
      const k = `${t.interval}__${t.title}`;
      const arr = byKey.get(k);
      if (arr) arr.push(t);
      else byKey.set(k, [t]);
    }
    const dead = new Set<string>();
    for (const [, group] of byKey) {
      const dupes = group.filter((t) => !t.custom);
      if (dupes.length < 2) continue;
      const keep = dupes.find((t) => t.active !== false) ?? dupes[0];
      for (const t of dupes) {
        if (t.id !== keep.id) {
          dead.add(t.id);
          await db.todos.delete(t.id).catch(() => {});
        }
      }
    }
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (dead.has(tasks[i].id)) tasks.splice(i, 1);
    }
  }
  // seed brand-new contracts from the user's personal template library,
  // so every contract starts with the same template set
  const lib = loadLib();
  if (tasks.length === 0) {
    const toAdd: {
      id: string; contractId: string; listId: string; title: string;
      interval: "daily" | "weekly" | "monthly" | "once"; ranks: string[];
      active: boolean; custom: boolean; updatedAt: string;
    }[] = [];
    for (const iv of ["daily", "weekly", "monthly", "once"] as const) {
      const listId = byInterval[iv];
      if (!listId) continue;
      lib[iv].forEach((t, i) => {
        toAdd.push({
          id: `${contractId}_todo_${iv}_${i}`,
          contractId,
          listId,
          title: t.title,
          interval: iv,
          ranks: t.ranks,
          active: true,
          custom: false,
          updatedAt: now,
        });
      });
    }
    await db.todos.bulkPut(toAdd).catch(() => {});
  } else {
    // deliver newly shipped presets to existing contracts:
    // titles with no row at all are brand-new (removed ones keep their
    // inactive row), so adding them never resurrects user-removed checks
    const have = new Set(tasks.map((t) => t.title));
    const toAdd: {
      id: string; contractId: string; listId: string; title: string;
      interval: "daily" | "weekly" | "monthly" | "once"; ranks: string[];
      active: boolean; custom: boolean; updatedAt: string;
    }[] = [];
    for (const iv of ["daily", "weekly", "monthly", "once"] as const) {
      const listId = byInterval[iv];
      if (!listId) continue;
      for (const t of lib[iv]) {
        if (!have.has(t.title)) {
          have.add(t.title);
          toAdd.push({
            id: uid("todo"),
            contractId,
            listId,
            title: t.title,
            interval: iv,
            ranks: t.ranks,
            active: true,
            custom: false,
            updatedAt: now,
          });
        }
      }
    }
    if (toAdd.length) await db.todos.bulkPut(toAdd).catch(() => {});
  }
}

export async function seedChecklistsIfEmpty() {
  const active = getActiveContractId();
  if (active) {
    await seedChecklistsForContract(active);
    return;
  }
  const count = await db.checklists.count();
  if (count > 0) return;
  const now = new Date().toISOString();
  await db.checklists.bulkAdd(
    JOB_TEMPLATES.map((t, i) => ({ ...t, id: `nocon_${i}`, done: t.items.map(() => false), custom: false, updatedAt: now }))
  );
}

export function progressId(contractId: string, cardId: string) {
  return `${contractId}__${cardId}`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
