export interface AlestaAlarm {
  id: string;
  label: string;
  time: string;
  on: boolean;
}

const KEY = "oa-alesta";
const FIRED_KEY = "oa-alesta-fired";

export function defaultAlarms(): AlestaAlarm[] {
  return [
    { id: "master", label: "Call Master", time: "06:00", on: false },
    { id: "co", label: "Call Chief Officer", time: "06:00", on: false },
    { id: "ce", label: "Call Chief Engineer", time: "06:00", on: false },
    { id: "crew", label: "Call Crew", time: "07:00", on: false },
  ];
}

export function loadAlarms(): AlestaAlarm[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultAlarms();
    const arr = JSON.parse(raw) as AlestaAlarm[];
    const base = defaultAlarms();
    return base.map((b) => ({ ...b, ...(arr.find((x) => x.id === b.id) ?? {}) }));
  } catch {
    return defaultAlarms();
  }
}

export function saveAlarms(a: AlestaAlarm[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch { /* ignore */ }
}

// Next fire within 24h: today at time, or tomorrow if already passed.
export function nextFire(time: string, now = new Date()): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h || 0, m || 0, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

function getFired(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

// Returns alarms whose time has come (each fires once per scheduled slot).
export function dueAlarms(now = new Date()): AlestaAlarm[] {
  let list: AlestaAlarm[];
  try {
    list = loadAlarms();
  } catch {
    return [];
  }
  const fired = getFired();
  const out: AlestaAlarm[] = [];
  let changed = false;
  for (const a of list) {
    if (!a.on || !a.time) continue;
    const fire = nextFire(a.time, now);
    if (now.getTime() >= fire.getTime() && fired[a.id] !== fire.toISOString()) {
      out.push(a);
      fired[a.id] = fire.toISOString();
      changed = true;
    }
  }
  if (changed) {
    try {
      localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
    } catch { /* ignore */ }
  }
  return out;
}
