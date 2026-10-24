"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, exportJSON } from "@/lib/db";
import { WIDGETS, loadWidgetPrefs, saveWidgetPrefs } from "@/lib/widgets";
import { FAQ } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPanels() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [widgets, setWidgets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidgets(loadWidgetPrefs());
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function toggleWidget(id: string) {
    const next = { ...widgets, [id]: !widgets[id] };
    setWidgets(next);
    saveWidgetPrefs(next);
  }

  async function exportAll() {
    exportJSON("shark-backup.json", {
      contracts: await db.contracts.toArray(),
      progress: await db.progress.toArray(),
      checklists: await db.checklists.toArray(),
      notes: await db.notes.toArray(),
      requests: await db.requests.toArray(),
      questions: await db.questions.toArray(),
      todos: await db.todos.toArray(),
      todoLogs: await db.todoLogs.toArray(),
      weights: await db.weights.toArray(),
      meds: await db.meds.toArray(),
      catalogue: await db.catalogue.toArray(),
      profile: await db.profile.toArray(),
    });
  }

  return (
    <div className="grid gap-4">
      {user && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">👤 Account & Session</h2>
          <p className="mt-1 opacity-70">
            Signed in as <span className="font-semibold text-stone-900 dark:text-stone-100">{user.displayName}</span> ({user.email})
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 rounded-full border border-red-300 bg-red-50 px-4 py-2 font-bold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
          >
            Sign out
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">🧩 Dashboard widgets</h2>
        <p className="mt-1 opacity-70">Show / hide dashboard sections to personalise your screen.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WIDGETS.map((w) => (
            <button key={w.id} onClick={() => toggleWidget(w.id)} className={`rounded-full border px-3 py-1.5 font-bold ${widgets[w.id] === false ? "opacity-40" : "bg-amber-100 dark:bg-red-950"}`}>
              {widgets[w.id] === false ? "○ " : "● "}{w.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">Data</h2>
        <p className="mt-1 font-medium text-stone-600 dark:text-red-300/70">Everything is stored on this device (offline-first). Export a backup before clearing browser data.</p>
        <button onClick={exportAll} className="mt-2 rounded-full border px-4 py-2 font-bold">Export full backup (JSON)</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">✉️ Contact</h2>
        <p className="mt-1 opacity-80">Questions, content requests, bug reports: <a href="mailto:support@officerassistant.app" className="font-bold underline">support@officerassistant.app</a> • Instagram & WhatsApp coming soon.</p>
        <a href="/contact" className="mt-2 inline-block rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Open Contact Us →</a>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">❓ FAQ</h2>
        <p className="mt-1 opacity-75">{FAQ.length} answers on offline use, contracts, backups, subscriptions, IMPA import and privacy.</p>
        <a href="/faq" className="mt-2 inline-block rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Open FAQ →</a>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">⚓ About Us</h2>
        <p className="mt-1 opacity-80">Shark is built by seafarers, for seafarers — the whole crew, not only officers. One offline-first companion for your whole life at sea: inspection check cards, job checklists, navigation tools, career documents, notes, store requests, menus, crew accounts and GIBS deadline counters.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/about" className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Our story, mission & vision →</a>
          <span className="rounded-full bg-amber-100 px-4 py-2 font-bold dark:bg-red-950">Fair winds! 🌊</span>
        </div>
      </div>
    </div>
  );
}
