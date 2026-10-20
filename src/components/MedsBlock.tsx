"use client";
import { useState } from "react";
import { db, uid } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";

export default function MedsBlock() {
  const meds = useLiveQuery(() => db.meds.toArray(), []);
  const [med, setMed] = useState("");
  const [qty, setQty] = useState("");

  async function addMed() {
    if (!med.trim()) return;
    await db.meds.add({ id: uid("med"), name: med.trim(), quantity: qty || "1", note: "", packed: false, updatedAt: new Date().toISOString() });
    setMed(""); setQty("");
  }

  const packedCount = (meds ?? []).filter((m) => m.packed).length;

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">💊 Medicines to take aboard</h2>
        <span className="text-xs font-bold">{packedCount}/{(meds ?? []).length} packed</span>
      </div>
      <div className="mt-2 flex gap-2 text-sm">
        <input value={med} onChange={(e) => setMed(e.target.value)} placeholder="e.g. Ibuprofen 400mg" className="flex-1 rounded-xl border px-3 py-1.5" />
        <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className="w-16 rounded-xl border px-2 py-1.5" />
        <button onClick={addMed} className="rounded-full bg-stone-900 px-3 py-1.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Add</button>
      </div>
      <ul className="mt-2 grid gap-1 text-sm">
        {(meds ?? []).map((m) => (
          <li key={m.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
            <input type="checkbox" checked={m.packed} onChange={() => db.meds.update(m.id, { packed: !m.packed })} className="h-4 w-4" />
            <span className={`flex-1 ${m.packed ? "line-through opacity-60" : "font-medium"}`}>{m.name}</span>
            <span className="text-xs">{m.quantity}</span>
            <button onClick={() => db.meds.delete(m.id)} className="text-xs font-bold text-red-600">✕</button>
          </li>
        ))}
        {(meds ?? []).length === 0 && <li className="text-xs">No medicines yet — your personal packing list.</li>}
      </ul>
    </div>
  );
}
