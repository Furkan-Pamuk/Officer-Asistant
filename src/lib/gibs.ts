import type { Contract } from "./types";

export const GIBS_DAYS = 60;
export const GIBS_URGENT_DAYS = 5;

export interface GibsStatus {
  deadline: Date | null;
  daysLeft: number | null;
  overdue: boolean;
  urgent: boolean;
  done: boolean;
}

function parseDateOnly(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function getGibsStatus(c: Contract | null | undefined): GibsStatus {
  return getStatus(c?.signOnDate ?? "", Boolean(c?.gibsDone));
}

export function getSignOffStatus(c: Contract | null | undefined): GibsStatus {
  return getStatus(c?.signOffDate ?? "", Boolean(c?.gibsOffDone));
}

function getStatus(startStr: string, done: boolean): GibsStatus {
  if (!startStr) return { deadline: null, daysLeft: null, overdue: false, urgent: false, done };
  const start = parseDateOnly(startStr);
  if (!start) return { deadline: null, daysLeft: null, overdue: false, urgent: false, done };
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + GIBS_DAYS);
  const today = startOfDay(new Date());
  const daysLeft = Math.ceil((startOfDay(deadline).getTime() - today.getTime()) / 86400000);
  return {
    deadline,
    daysLeft,
    overdue: !done && daysLeft < 0,
    urgent: !done && daysLeft >= 0 && daysLeft <= GIBS_URGENT_DAYS,
    done,
  };
}

export function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
