"use client";
import { useEffect, useState } from "react";
import { db, uid } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import type { WeightEntry } from "@/lib/types";
import WaterCard from "./WaterCard";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function HealthSection() {
  const weights = useLiveQuery(() => db.weights.orderBy("date").toArray(), []);
  const [kg, setKg] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => { setDate(today()); }, []);

  async function addWeight() {
    const v = parseFloat(kg.replace(",", "."));
    if (!v || v < 20 || v > 300) { alert("Enter a valid weight in kg"); return; }
    const now = new Date().toISOString();
    await db.weights.add({ id: uid("w"), date: date || today(), kg: Math.round(v * 10) / 10, createdAt: now });
    setKg("");
  }

  const sorted = (weights ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const prev = sorted[1];
  const delta = latest && prev ? Math.round((latest.kg - prev.kg) * 10) / 10 : null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
      <WaterCard latestKg={latest?.kg ?? null} />
      <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-amber-200 pt-4 dark:border-red-950">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">❤️ Weight tracking</h2>
          {latest && <span className="text-sm font-bold">{latest.kg} kg {delta !== null && delta !== 0 && <span className={delta > 0 ? "text-red-600" : "text-emerald-600"}>({delta > 0 ? "+" : ""}{delta})</span>}</span>}
        </div>
        <div className="mt-2 flex gap-2 text-sm">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border px-2 py-1.5" />
          <input value={kg} onChange={(e) => setKg(e.target.value)} placeholder="kg" inputMode="decimal" className="w-20 rounded-xl border px-3 py-1.5" />
          <button onClick={addWeight} className="rounded-full bg-stone-900 px-3 py-1.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Add</button>
        </div>
        <ul className="mt-2 grid min-h-0 flex-1 gap-1 overflow-auto text-sm">
          {sorted.slice(0, 8).map((w: WeightEntry) => (
            <li key={w.id} className="flex justify-between rounded-lg bg-amber-50 px-2 py-1 dark:bg-black dark:ring-1 dark:ring-red-950">
              <span>{w.date}</span><span className="font-bold">{w.kg} kg</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
