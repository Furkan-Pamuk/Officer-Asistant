"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { db, setActiveContractId } from "@/lib/db";
import { SEED_CARDS, INSPECTION_TYPES } from "@/lib/data";
import type { Contract, JobChecklist, Note, StoreRequest, EditorQuestion, TodoLog, TodoTask } from "@/lib/types";
import type { ProgressRow } from "@/lib/db";
import GibsCountdown from "@/components/GibsCountdown";

export default function ArchiveClient({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLocale();
  const { id } = use(params);
  const [contract, setContract] = useState<Contract | null | undefined>(undefined);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [lists, setLists] = useState<JobChecklist[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [todoLogs, setTodoLogs] = useState<TodoLog[]>([]);

  useEffect(() => {
    async function load() {
      setContract((await db.contracts.get(id)) ?? null);
      setProgress(await db.progress.where("contractId").equals(id).toArray());
      setLists(await db.checklists.where("contractId").equals(id).toArray());
      setNotes(await db.notes.where("contractId").equals(id).toArray());
      setRequests(await db.requests.where("contractId").equals(id).toArray());
      setQuestions(await db.questions.where("contractId").equals(id).toArray());
      setTodos(await db.todos.where("contractId").equals(id).toArray());
      setTodoLogs(await db.todoLogs.where("contractId").equals(id).toArray());
    }
    load();
  }, [id]);

  if (contract === undefined) return <p>{t("ctr.loadingArchive")}</p>;
  if (!contract) return <p>{t("ctr.notFound")} <Link href="/contracts" className="underline">{t("common.back")}</Link></p>;

  const cardTitle = (cardId: string) => SEED_CARDS.find((c) => c.id === cardId)?.title ?? cardId;
  const inspName = (cardId: string) => {
    const c = SEED_CARDS.find((x) => x.id === cardId);
    return INSPECTION_TYPES.find((t) => t.id === c?.inspection)?.short ?? "";
  };

  async function reactivate() {
    if (!contract) return;
    await db.contracts.update(id, { status: "active", updatedAt: new Date().toISOString() });
    setActiveContractId(id);
    setContract({ ...contract, status: "active" });
  }

  return (
    <div className="grid gap-4">
      <Link href="/contracts" className="w-fit text-sm font-bold underline">{t("ctr.allContracts")}</Link>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{t("ctr.archiveTitle").replace("{s}", contract.shipName)}</h1>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold dark:bg-red-950 dark:text-red-200">{contract.status}</span>
          {contract.status === "archived" && (
            <button onClick={reactivate} className="ml-auto rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("ctr.reactivateThis")}</button>
          )}
        </div>
        <p className="mt-1 text-sm font-medium">
          {contract.shipType} • {contract.rank} • {contract.company} • {t("ctr.joined")} {contract.signOnDate} {t("ctr.at")} {contract.joinPort || "—"}
          {contract.signOffDate ? t("ctr.signedOffOn").replace("{d}", contract.signOffDate) : ""}
        </p>
      </div>
      <GibsCountdown contract={contract} />

      <section className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">{t("ctr.cardHist").replace("{n}", String(progress.length))}</h2>
        <ul className="mt-2 grid gap-1 text-sm">
          {progress.slice().sort((a, b) => b.completedAt.localeCompare(a.completedAt)).map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
              <span><strong>[{inspName(p.cardId)}]</strong> {cardTitle(p.cardId)}</span>
              <span className="font-medium">{new Date(p.completedAt).toLocaleString()}</span>
            </li>
          ))}
          {progress.length === 0 && <li className="text-sm">{t("ctr.noCards")}</li>}
        </ul>
      </section>

      <div className="grid gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("ctr.listsN").replace("{n}", String(lists.length))}</h2>
          {lists.map((l) => <p key={l.id} className="mt-1">{l.title} — {l.done.filter(Boolean).length}/{l.items.length}</p>)}
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("ctr.reqN").replace("{n}", String(requests.length))}</h2>
          {requests.slice(-8).reverse().map((r) => <p key={r.id} className="mt-1">{r.item} — {r.quantity} {r.unit} ({r.status})</p>)}
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("ctr.notesN").replace("{n}", String(notes.length))}</h2>
          {notes.slice(-5).reverse().map((n) => <p key={n.id} className="mt-1"><strong>{n.title}:</strong> {n.body.slice(0, 120)}</p>)}
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("ctr.editorN").replace("{n}", String(questions.length))}</h2>
          {questions.slice(-5).reverse().map((q) => <p key={q.id} className="mt-1">Q: {q.question.slice(0, 120)}</p>)}
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("ctr.todosN").replace("{t}", String(todos.length)).replace("{c}", String(todoLogs.length))}</h2>
          {todos.slice(0, 8).map((t) => <p key={t.id} className="mt-1">[{t.interval}] {t.title}</p>)}
        </div>
      </div>
    </div>
  );
}
