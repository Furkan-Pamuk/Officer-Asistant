export interface CheckReminders {
  daily: { on: boolean; time: string };
  weekly: { on: boolean; weekday: number; time: string };
  monthly: { on: boolean; day: number; time: string };
}

const KEY = "oa-check-reminders";
const FIRED_KEY = "oa-check-reminder-fired";

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function defaultReminders(): CheckReminders {
  return {
    daily: { on: true, time: "12:30" },
    weekly: { on: true, weekday: 0, time: "12:30" },
    monthly: { on: true, day: 1, time: "12:30" },
  };
}

export function loadReminders(): CheckReminders {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultReminders();
    const p = JSON.parse(raw);
    const d = defaultReminders();
    return {
      daily: { ...d.daily, ...p.daily },
      weekly: { ...d.weekly, ...p.weekly },
      monthly: { ...d.monthly, ...p.monthly },
    };
  } catch {
    return defaultReminders();
  }
}

export function saveReminders(r: CheckReminders) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch { /* ignore */ }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getFired(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function setFired(k: string, v: string) {
  try {
    const f = getFired();
    f[k] = v;
    localStorage.setItem(FIRED_KEY, JSON.stringify(f));
  } catch { /* ignore */ }
}

// Returns which reminders are due right now (device-local time, "LT").
export function dueChecks(now = new Date()): ("daily" | "weekly" | "monthly")[] {
  let cfg: CheckReminders;
  try {
    cfg = loadReminders();
  } catch {
    return [];
  }
  const fired = getFired();
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekKey = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
  const monthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const out: ("daily" | "weekly" | "monthly")[] = [];
  if (cfg.daily.on && hhmm >= cfg.daily.time && fired.daily !== dayKey) {
    out.push("daily");
    setFired("daily", dayKey);
  }
  if (cfg.weekly.on && (now.getDay() + 6) % 7 === cfg.weekly.weekday && hhmm >= cfg.weekly.time && fired.weekly !== weekKey) {
    out.push("weekly");
    setFired("weekly", weekKey);
  }
  if (cfg.monthly.on && now.getDate() === cfg.monthly.day && hhmm >= cfg.monthly.time && fired.monthly !== monthKey) {
    out.push("monthly");
    setFired("monthly", monthKey);
  }
  return out;
}
