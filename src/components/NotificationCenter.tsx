"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { loadAlarms, saveAlarms, nextFire, type AlestaAlarm } from "@/lib/alesta";
import { WEEKDAYS, loadReminders, saveReminders, type CheckReminders } from "@/lib/checkReminders";
import { useLocale } from "@/lib/i18n";
import {
  type NotificationItem,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NOTIFICATIONS_UPDATED_EVENT,
} from "@/lib/notifications";

function CheckRow({ label, on, onToggle, children }: { label: string; on: boolean; onToggle: () => void; children: React.ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="rounded-lg px-1.5 py-1">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          aria-label={t("notif.checksAria").replace("{x}", label)}
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
  const { t } = useLocale();
  const [items, setItems] = useState<NotificationItem[]>([]);
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

  const load = useCallback(async () => {
    try {
      const fresh = await fetchNotifications();
      setItems(fresh);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    load();
    setAlarms(loadAlarms());
    setChecks(loadReminders());

    const t = setInterval(load, 30000);

    const onUpdate = () => {
      load();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      clearInterval(t);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [load]);

  const handleItemClick = async (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    await markNotificationAsRead(id);
    setOpen(false);
  };

  const handleDismissItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setItems((prev) => prev.filter((x) => x.id !== id));
    await markNotificationAsRead(id);
  };

  const handleMarkAllRead = async () => {
    const prev = items;
    setItems([]);
    await markAllNotificationsAsRead(prev);
  };

  function updateAlarm(id: string, patch: Partial<AlestaAlarm>) {
    const next = alarms.map((a) => (a.id === id ? { ...a, ...patch } : a));
    setAlarms(next);
    saveAlarms(next);
    if (patch.on && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
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
      <button onClick={() => setOpen(!open)} title={t("notif.title")} aria-label={t("notif.title")} className="relative flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 text-lg dark:border-red-900">
        🔔
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-amber-200 bg-white p-2 shadow-xl dark:border-red-900 dark:bg-neutral-950">
          <div className="mb-1 flex items-center justify-between px-2 py-1">
            <span className="text-xs font-black uppercase tracking-widest opacity-60">
              {t("notif.titleN").replace("{n}", String(items.length))}
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-amber-700 hover:underline dark:text-red-400"
              >
                {t("notif.markAllRead") || "Mark all as read"}
              </button>
            )}
          </div>
          <button onClick={() => setShowChecks(!showChecks)} className="mb-1 flex w-full items-center justify-between rounded-xl bg-amber-100 px-2.5 py-2 text-sm font-black dark:bg-red-950">
            <span>{t("notif.reminders")}</span>
            <span>{showChecks ? "▴" : "▾"}</span>
          </button>
          {showChecks && checks && (
            <div className="mb-1 grid gap-1 rounded-xl border border-dashed border-amber-300 p-1.5 text-sm dark:border-red-900">
              <CheckRow
                label={t("notif.daily")} on={checks.daily.on}
                onToggle={() => setChecksAndSave({ ...checks, daily: { ...checks.daily, on: !checks.daily.on } })}
              >
                <input type="time" value={checks.daily.time} onChange={(e) => setChecksAndSave({ ...checks, daily: { ...checks.daily, time: e.target.value } })} className="w-full rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <CheckRow
                label={t("notif.weekly")} on={checks.weekly.on}
                onToggle={() => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, on: !checks.weekly.on } })}
              >
                <select value={checks.weekly.weekday} onChange={(e) => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, weekday: Number(e.target.value) } })} className="rounded-lg border px-1 py-0.5 text-xs">
                  {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
                <input type="time" value={checks.weekly.time} onChange={(e) => setChecksAndSave({ ...checks, weekly: { ...checks.weekly, time: e.target.value } })} className="rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <CheckRow
                label={t("notif.monthly")} on={checks.monthly.on}
                onToggle={() => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, on: !checks.monthly.on } })}
              >
                <span className="text-xs opacity-60">{t("notif.day")}</span>
                <input type="number" min={1} max={28} value={checks.monthly.day} onChange={(e) => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, day: Math.min(28, Math.max(1, Number(e.target.value) || 1)) } })} className="w-14 rounded-lg border px-1.5 py-0.5 text-xs" />
                <input type="time" value={checks.monthly.time} onChange={(e) => setChecksAndSave({ ...checks, monthly: { ...checks.monthly, time: e.target.value } })} className="rounded-lg border px-1.5 py-0.5 text-xs" />
              </CheckRow>
              <p className="px-1.5 text-[11px] opacity-60">{t("notif.devTime")}</p>
            </div>
          )}
          <button onClick={() => setShowAlarms(!showAlarms)} className="mb-1 flex w-full items-center justify-between rounded-xl bg-amber-100 px-2.5 py-2 text-sm font-black dark:bg-red-950">
            <span>{t("notif.alesta")}</span>
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
                        aria-label={`${a.label} ${a.on ? t("route.off") : t("route.on")}`}
                        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${a.on ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"}`}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${a.on ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                      <span className="flex-1 font-bold">{a.label}</span>
                      <input type="time" value={a.time} onChange={(e) => updateAlarm(a.id, { time: e.target.value })} className="w-24 rounded-lg border px-1.5 py-0.5 text-xs" />
                    </div>
                    {a.on && <div className="pl-11 text-[11px] opacity-60">{t("notif.rings").replace("{w}", when)}</div>}
                  </div>
                );
              })}
              <p className="px-1.5 text-[11px] opacity-60">{t("notif.timeOnly")}</p>
            </div>
          )}
          {items.length === 0 && <p className="px-2 py-3 text-sm opacity-70">{t("notif.clear")}</p>}
          {items.map((i) => (
            <div
              key={i.id}
              className={`group mb-1 flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-amber-50 dark:hover:bg-red-950/50 ${
                i.hot ? "ring-1 ring-red-400" : ""
              }`}
            >
              <Link
                href={i.href}
                onClick={() => handleItemClick(i.id)}
                className="flex min-w-0 flex-1 items-start gap-2"
              >
                <span className="text-xl shrink-0">{i.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{i.title}</span>
                  <span className="block truncate text-xs opacity-60">{i.detail}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={(e) => handleDismissItem(e, i.id)}
                title={t("notif.dismiss") || "Dismiss"}
                aria-label={t("notif.dismiss") || "Dismiss"}
                className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs opacity-40 hover:bg-amber-200/60 hover:opacity-100 dark:hover:bg-red-900/60"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
