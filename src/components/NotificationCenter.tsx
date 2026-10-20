"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { db, getActiveContractId } from "@/lib/db";
import { getGibsStatus, getSignOffStatus, formatDate } from "@/lib/gibs";
import { NEWS } from "@/lib/news";
import { loadAlarms, saveAlarms, nextFire, type AlestaAlarm } from "@/lib/alesta";
import { WEEKDAYS, loadReminders, saveReminders, type CheckReminders } from "@/lib/checkReminders";

interface Item {
  id: string;
  icon: string;
  title: string;
  detail: string;
  href: string;
  hot: boolean;
}

const SEEN_KEY = "oa-news-seen";

function CheckRow({ label, on, onToggle, children }: { label: string; on: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-1.5 py-1">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          aria-label={`${label} checks on/off`}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
        </button>
        <span className="font-bold">{label}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 pl-11">{children}</div>
    </div>
  );
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [alarms, setAlarms] = useState<AlestaAlarm[]>([]);
  const [showAlarms, setShowAlarms] = useState(false);
  const [checks, setChecks] = useState<CheckReminders | null>(null);
  const [showChecks, setShowChecks] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    async function load() {
      const out: Item[] = [];
      try {
        const contracts = await db.contracts.toArray();
        const activeId = getActiveContractId();
        const active = contracts.find((c) => c.id === activeId) ?? null;
        if (active) {
          const g = getGibsStatus(active);
          if (!g.done && (g.urgent || g.overdue) && g.deadline) {
            out.push({ id: "gibs", icon: "📋", title: `GIBS: ${g.overdue ? "OVERDUE" : `${g.daysLeft} days left`}`, detail: `Sign-on docs • deadline ${formatDate(g.deadline)}`, href: "/dashboard", hot: true });
          }
        }
        const ended = contracts.find((c) => c.status === "archived" && c.signOffDate && !c.gibsOffDone);
        if (ended) {
          const s = getSignOffStatus(ended);
          out.push({ id: "signoff", icon: "🛳️", title: "Sign-off docs pending", detail: `${ended.shipName} • signed off ${ended.signOffDate}${s.deadline ? ` • deadline ${formatDate(s.deadline)}` : ""}`, href: "/dashboard", hot: Boolean(s.urgent || s.overdue) });
        }
        const now = new Date().toISOString();
        const due = await db.notes.where("remindAt").belowOrEqual(now).toArray();
        for (const n of due.filter((x) => !x.reminded && x.remindAt).slice(0, 5)) {
          out.push({ id: `note-${n.id}`, icon: "🔔", title: n.title, detail: (n.body || "Voice note").slice(0, 80), href: "/notes", hot: true });
        }
        try {
          const wxRaw = localStorage.getItem("oa-wx-cache");
          if (wxRaw) {
            const wx = JSON.parse(wxRaw);
            if (wx.wind >= 25) out.push({ id: "wx-wind", icon: "💨", title: `Strong wind ${Math.round(wx.wind)} kn`, detail: wx.place ?? "on position", href: "/dashboard", hot: true });
            else if ((wx.precip ?? 0) > 5) out.push({ id: "wx-rain", icon: "🌧️", title: `Heavy rain ${wx.precip} mm`, detail: wx.place ?? "on position", href: "/dashboard", hot: false });
          }
        } catch { /* ignore */ }
        let seen: string[] = [];
        try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"); } catch { /* ignore */ }
        for (const p of NEWS.filter((x) => !seen.includes(x.id)).slice(0, 3)) {
          out.push({ id: `news-${p.id}`, icon: "📰", title: p.title, detail: `${p.tag} • ${p.date}`, href: `/news/${p.id}`, hot: false });
        }
      } catch { /* ignore */ }
      setItems(out);
    }
    load();
    setAlarms(loadAlarms());
    setChecks(loadReminders());
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [open]);

  function updateAlarm(id: string, patch: Partial<AlestaAlarm>) {
    const next = alarms.map((a) => (a.id === id ? { ...a, ...patch } : a));
    setAlarms(next);
    saveAlarms(next);
    if (patch.on && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  function markNewsSeen() {
    try {
      const ids = items.filter((i) => i.id.startsWith("news-")).map((i) => i.id.slice(5));
      const prev: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(new Set([...prev, ...ids]))));
    } catch { /* ignore */ }
  }

  function setChecksAndSave(next: CheckReminders) {
    const turnedOn = (!checks?.daily.on && next.daily.on) || (!checks?.weekly.on && next.weekly.on) || (!checks?.monthly.on && next.monthly.on);
    setChecks(next);
    saveReminders(next);
    if (turnedOn && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={() => setOpen(!open)} title="Notifications" aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 text-lg dark:border-red-900">
        🔔
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-amber-200 bg-white p-2 shadow-xl dark:border-red-900 dark:bg-neutral-950">
          <div className="px-2 py-1 text-xs font-black uppercase tracking-widest opacity-60">Notifications ({items.length})</div>
          <button onClick={() => setShowChecks(!showChecks)} className="mb-1 flex w-full items-center justify-between rounded-xl bg-amber-100 px-2.5 py-2 text-sm font-black dark:bg-red-950">
            <span>📋 Check reminders</span>
            <span>{showChecks ? "▴" : "▾"}</span>
          </button>
          {showChecks && checks && (
            <div className="mb-1 grid gap-1 rounded-xl border border-dashed border-amber-300 p-1.5 text-sm dark:border-red-900">
              <CheckRow
                label="Daily" on={checks.daily.on}
                onToggle={() => setChecksAndSave({ ...checks, daily: { ...checks.daily, on: !checks.daily.on } })}
              >
                <input type="time" value={checks.daily.time} onChange={(e) => setChecksAndSave({ ...checks, daily: { ...checks.daily, time: e.target.value } })} className="w-full rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <CheckRow
                label="Weekly" on={checks.weekly.on}
                onToggle={() => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, on: !checks.weekly.on } })}
              >
                <select value={checks.weekly.weekday} onChange={(e) => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, weekday: Number(e.target.value) } })} className="rounded-lg border px-1 py-0.5 text-xs">
                  {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
                <input type="time" value={checks.weekly.time} onChange={(e) => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, time: e.target.value } })} className="rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <CheckRow
                label="Monthly" on={checks.monthly.on}
                onToggle={() => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, on: !checks.monthly.on } })}
              >
                <span className="text-xs opacity-60">day</span>
                <input type="number" min={1} max={28} value={checks.monthly.day} onChange={(e) => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, day: Math.min(28, Math.max(1, Number(e.target.value) || 1)) } })} className="w-14 rounded-lg border px-1.5 py-0.5 text-xs" />
                <input type="time" value={checks.monthly.time} onChange={(e) => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, time: e.target.value } })} className="rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <p className="px-1.5 text-[11px] opacity-60">Device time • fires while the app is open.</p>
            </div>
          )}
          <button onClick={() => setShowAlarms(!showAlarms)} className="mb-1 flex w-full items-center justify-between rounded-xl bg-amber-100 px-2.5 py-2 text-sm font-black dark:bg-red-950">
            <span>⏰ Alesta alarms</span>
            <span>{showAlarms ? "▴" : "▾"}</span>
          </button>
          {showAlarms && (
            <div className="mb-1 grid gap-1 rounded-xl border border-dashed border-amber-300 p-1.5 dark:border-red-900">
              {alarms.map((a) => {
                const fire = nextFire(a.time);
                const when = fire.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={a.id} className="rounded-lg px-1.5 py-1 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateAlarm(a.id, { on: !a.on })}
                        aria-label={`${a.label} ${a.on ? "off" : "on"}`}
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${a.on ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${a.on ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                      <span className="flex-1 font-bold">{a.label}</span>
                      <input type="time" value={a.time} onChange={(e) => updateAlarm(a.id, { time: e.target.value })} className="w-24 rounded-lg border px-1.5 py-0.5 text-xs" />
                    </div>
                    {a.on && <div className="pl-11 text-[11px] opacity-60">rings {when}</div>}
                  </div>
                );
              })}
              <p className="px-1.5 text-[11px] opacity-60">Time only — rings within 24h while the app is open.</p>
            </div>
          )}
          {items.length === 0 && <p className="px-2 py-3 text-sm opacity-70">All clear — no alerts right now.</p>}
          {items.map((i) => (
            <Link key={i.id} href={i.href} onClick={() => { if (i.id.startsWith("news-")) markNewsSeen(); setOpen(false); }} className={`mb-1 flex gap-2 rounded-xl px-2.5 py-2 hover:bg-amber-50 dark:hover:bg-red-950/50 ${i.hot ? "ring-1 ring-red-400" : ""}`}>
              <span className="text-xl">{i.icon}</span>
              <span>
                <span className="block text-sm font-bold">{i.title}</span>
                <span className="block text-xs opacity-60">{i.detail}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
