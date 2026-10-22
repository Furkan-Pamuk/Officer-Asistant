"use client";
import { useEffect } from "react";
import { db } from "@/lib/db";
import { useLocale } from "@/lib/i18n";
import { dueChecks } from "@/lib/checkReminders";
import { dueAlarms } from "@/lib/alesta";

// Fires local notifications for due note reminders while the app is open.
export default function ReminderChecker() {
  const { t } = useLocale();
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
              new Notification(t("rc.remind"), { body: `${n.title}${n.body ? " — " + n.body.slice(0, 120) : ""}`, tag: `note-${n.id}` });
            } catch { /* ignore */ }
          }
          await db.notes.update(n.id, { reminded: true });
        }
        if ("Notification" in window && Notification.permission === "granted") {
          for (const kind of dueChecks()) {
            const label = kind === "daily" ? "📋 Daily checks" : kind === "weekly" ? "📋 Weekly checks" : "📋 Monthly checks";
            try {
              new Notification(label, { body: t("rc.openPlan"), tag: `checks-${kind}` });
            } catch { /* ignore */ }
          }
          for (const a of dueAlarms()) {
            try {
              new Notification(`🔔 ${a.label}`, { body: t("rc.alesta").replace("{x}", a.time), tag: `alesta-${a.id}` });
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
      if (alive) setTimeout(tick, 30000);
    }
    const timer = setTimeout(tick, 5000);
    return () => { alive = false; clearTimeout(timer); };
  }, [t]);
  return null;
}
