"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveContractId } from "@/lib/db";
import NotesPanel from "@/components/NotesPanel";

export default function NotesPage() {
  const [ready, setReady] = useState(false);
  const [has, setHas] = useState(false);

  useEffect(() => {
    setHas(Boolean(getActiveContractId()));
    setReady(true);
  }, []);

  if (!ready) return <p>Loading…</p>;
  if (!has) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Notes</h1>
        <p className="text-sm">Select a contract first — notes are kept per vessel.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div><h1 className="text-2xl font-bold">Notes — this contract</h1><p className="text-sm font-medium opacity-70">Text + voice, with bell reminders. Archived with the vessel.</p></div>
      <NotesPanel />
    </div>
  );
}
