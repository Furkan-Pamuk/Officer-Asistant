"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db, getActiveContractId, seedTodosForContract } from "@/lib/db";
import { periodKeyFor } from "@/lib/todos";

export default function TodoWidget() {
  const [summary, setSummary] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    let alive = true;
    let prev = "";
    async function load() {
      const id = getActiveContractId();
      if (!id) { if (alive) setSummary(null); return; }
      await seedTodosForContract(id);
      const tasks = await db.todos.where("contractId").equals(id).toArray();
      const active = tasks.filter((t) => t.active);
      const logs = await db.todoLogs.where("contractId").equals(id).toArray();
      const set = new Set(logs.map((l) => l.id));
      const done = active.filter((t) => set.has(`${t.id}__${periodKeyFor(t.interval)}`)).length;
      const key = `${done}/${active.length}`;
      if (alive && key !== prev) { prev = key; setSummary({ done, total: active.length }); }
    }
    load();
    const i = setInterval(load, 5000);
    return () => { alive = false; clearInterval(i); };
  }, []);

  if (!summary) return null;
  return (
    <Link href="/checklists" className="rounded-2xl border border-amber-200 bg-white p-4 font-medium dark:border-red-950 dark:bg-neutral-950">
      📋 To-Do today: <strong>{summary.done}/{summary.total}</strong> done — open list
    </Link>
  );
}
