"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CONFETTI = ["#2AA198", "#7FD1C0", "#0E1E33", "#F4F7FA", "#33475C"];

export default function WaterCard({ latestKg }: { latestKg: number | null }) {
  const [today, setToday] = useState("");
  const rows = useLiveQuery(() => db.water.toArray(), []);
  const [burst, setBurst] = useState(0);
  const wasDone = useRef(false);

  useEffect(() => { setToday(dayKey(new Date())); }, []);

  const targetMl = latestKg ? Math.round((latestKg * 35) / 50) * 50 : 2500;
  const targetL = (targetMl / 1000).toFixed(1).replace(".", ",");
  const drunk = today ? (rows ?? []).find((r) => r.id === today)?.ml ?? 0 : 0;
  const done = drunk >= targetMl;
  const pct = Math.min(100, Math.round((drunk / targetMl) * 100));

  useEffect(() => {
    if (done && !wasDone.current) setBurst((b) => b + 1);
    wasDone.current = done;
  }, [done]);

  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 2600);
    return () => clearTimeout(t);
  }, [burst]);

  async function drink() {
    if (!today) return;
    const now = new Date().toISOString();
    await db.water.put({ id: today, ml: targetMl, updatedAt: now });
  }

  async function reset() {
    if (!today) return;
    await db.water.delete(today);
    wasDone.current = false;
  }

  return (
    <div className="relative overflow-hidden">
      {burst > 0 && (
        <div key={burst} className="pointer-events-none absolute inset-0 z-10">
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="oa-confetti"
              style={{
                left: `${8 + ((i * 37) % 84)}%`,
                background: CONFETTI[i % CONFETTI.length],
                animationDelay: `${(i % 9) * 0.06}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 pt-1">
        <div className={`oa-drop shrink-0 py-1 text-5xl leading-none ${done ? "oa-drop-happy" : ""}`} aria-hidden>💧</div>
        <div className="flex-1">
          <h2 className="font-bold">Drink {targetL} litres of water today</h2>
          <p className="text-xs font-medium opacity-70">
            {latestKg ? `Based on your last weight (${latestKg} kg × 35 ml)` : "Log your weight for a personal target"} • {(drunk / 1000).toFixed(2).replace(".", ",")} L so far
          </p>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-amber-100 dark:bg-red-950">
            <div className="h-full rounded-full bg-[#2AA198] transition-all dark:bg-red-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2 text-sm">
        <button onClick={drink} className="rounded-full bg-amber-400 px-4 py-1.5 font-bold text-stone-950 dark:bg-red-700 dark:text-white">🥛 I drank my water (fill bar)</button>
        <button onClick={reset} className="rounded-full border px-3 py-1.5 text-xs font-bold">Reset day</button>
        {done && <span className="self-center text-sm font-bold text-amber-700">Goal reached! 🎉</span>}
      </div>
    </div>
  );
}
