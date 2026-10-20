"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { getSignOffStatus, formatDate } from "@/lib/gibs";
import type { Contract } from "@/lib/types";

const GIBS_URL = "https://e-denizcilik.uab.gov.tr/login?accessKey=06196f1f393448e69193fafa45dfa7be";

export default function SignOffReminder() {
  const [c, setC] = useState<Contract | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const list = await db.contracts.orderBy("updatedAt").reverse().toArray();
      const hit = list.find((x) => x.status === "archived" && x.signOffDate && !x.gibsOffDone) ?? null;
      if (alive) setC(hit);
    }
    load();
    const t = setInterval(load, 4000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!c) return null;
  const s = getSignOffStatus(c);

  async function markDone() {
    await db.contracts.update(c!.id, { gibsOffDone: true, updatedAt: new Date().toISOString() });
    setC(null);
  }

  async function enableAlerts() {
    if (!("Notification" in window)) { alert("Browser notifications not supported"); return; }
    const p = await Notification.requestPermission();
    alert(p === "granted" ? "Alerts enabled on this device." : "Notifications not granted — in-app banner still works.");
  }

  const hot = s.urgent || s.overdue;

  return (
    <div className={`animate-pulse rounded-2xl border-2 p-4 ${hot ? "border-red-600 bg-red-50 dark:border-red-600 dark:bg-red-950/30" : "border-amber-300 bg-amber-50 dark:border-red-950 dark:bg-neutral-950"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">SIGN-OFF DOCUMENTS</span>
        {s.daysLeft !== null && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${hot ? "bg-red-700" : "bg-stone-500"}`}>
            {s.overdue ? "OVERDUE" : `${s.daysLeft} DAYS LEFT`}
          </span>
        )}
        <a href={GIBS_URL} target="_blank" rel="noreferrer" className="font-bold underline">
          Upload your Sign-off Ordino and Service Letter to GIBS ↗
        </a>
        <span className="text-sm font-bold">Signed off: {c.signOffDate}{s.deadline ? ` • Deadline: ${formatDate(s.deadline)}` : ""} — {c.shipName}</span>
        <span className="ml-auto flex gap-2">
          <button onClick={enableAlerts} className="rounded-full border px-3 py-1 text-xs font-bold">Enable alerts</button>
          <button onClick={markDone} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-600 dark:text-white">Mark uploaded</button>
        </span>
      </div>
    </div>
  );
}
