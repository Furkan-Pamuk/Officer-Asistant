"use client";
import { useEffect, useMemo, useState } from "react";
import { db, getActiveContractId, seedTodosForContract } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import type { TodoList, TodoLog, TodoTask } from "@/lib/types";

export function matchesRank(ranks: string[] | undefined, rank: string) {
  return rank === "all" || !ranks || ranks.length === 0 || ranks.includes(rank);
}

// Shared loader for every surface that renders todo lists:
// active contract + its lists/tasks/logs + profile rank lock.
export function useTodoData() {
  const [contractId, setContractId] = useState<string | null>(null);
  const [profileRank, setProfileRank] = useState("");
  const lists = useLiveQuery(
    () => (contractId ? db.todoLists.where("contractId").equals(contractId).toArray() : Promise.resolve([] as TodoList[])),
    [contractId]
  );
  const tasks = useLiveQuery(
    () => (contractId ? db.todos.where("contractId").equals(contractId).toArray() : Promise.resolve([] as TodoTask[])),
    [contractId]
  );
  const logs = useLiveQuery(
    () => (contractId ? db.todoLogs.where("contractId").equals(contractId).toArray() : Promise.resolve([] as TodoLog[])),
    [contractId]
  );

  useEffect(() => {
    const id = getActiveContractId();
    setContractId(id);
    if (id) seedTodosForContract(id);
    db.profile.get("me").then((p) => setProfileRank(p?.rank ?? "")).catch(() => {});
  }, []);

  const doneSet = useMemo(() => new Set((logs ?? []).map((l) => l.id)), [logs]);

  return {
    contractId,
    lists: lists ?? [],
    tasks: tasks ?? [],
    doneSet,
    lockedRank: profileRank || null,
  };
}
