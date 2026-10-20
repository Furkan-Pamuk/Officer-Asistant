"use client";
import { useEffect } from "react";
import { db } from "@/lib/db";
import { dueChecks } from "@/lib/checkReminders";
import { dueAlarms } from "@/lib/alesta";

// Fires local notifications for due note reminders while the app is open.
export default function ReminderChecker() {
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const now = new Date().toISOString();
        const due = await db.notes.where("remindAt").belowOrEqual(now).toArray();
        for (const n of due) {
          if (n.reminded || !n.remindAt) continue;
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("⏰ Reminder", { body: `${n.title}${n.body ? " — " + n.body.slice(0, 120) : ""}`, tag: `note-${n.id}` });
            } catch { /* ignore */ }
          }
          await db.notes.update(n.id, { reminded: true });
        }
        if ("Notification" in window && Notification.permission === "granted") {
          for (const kind of dueChecks()) {
            const label = kind === "daily" ? "📋 Daily checks" : kind === "weekly" ? "📋 Weekly checks" : "📋 Monthly checks";
            try {
              new Notification(label, { body: "Open Job Plan → To-Do and tick this period's items.", tag: `checks-${kind}` });
            } catch { /* ignore */ }
          }
          for (const a of dueAlarms()) {
            try {
              new Notification(`🔔 ${a.label}`, { body: `Alesta alarm — time to call. (${a.time})`, tag: `alesta-${a.id}` });
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
      if (alive) setTimeout(tick, 30000);
    }
    const t = setTimeout(tick, 5000);
    return () => { alive = false; clearTimeout(t); };
  }, []);
  return null;
}
