"use client";
import { useEffect } from "react";
import { db } from "@/lib/db";
import { getGibsStatus, formatDate } from "@/lib/gibs";
import { useLocale } from "@/lib/i18n";
import type { Contract } from "@/lib/types";

const GIBS_URL = "https://e-denizcilik.uab.gov.tr/login?accessKey=06196f1f393448e69193fafa45dfa7be";

export default function GibsCountdown({ contract }: { contract: Contract }) {
  const { t } = useLocale();
  const s = getGibsStatus(contract);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (!s.urgent && !s.overdue) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(s.overdue ? t("gib.notifOver") : t("gib.notifLeft").replace("{n}", String(s.daysLeft)), {
        body: `${contract.shipName}: GIBS deadline ${formatDate(s.deadline)}.`,
        tag: `gibs-${contract.id}`,
      });
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract.id, s.daysLeft, s.overdue]);

  async function markDone(done: boolean) {
    const now = new Date().toISOString();
    await db.contracts.update(contract.id, { gibsDone: done, gibsDoneAt: done ? now : "", updatedAt: now });
  }

  async function enableAlerts() {
    if (!("Notification" in window)) { alert(t("gib.noNotif")); return; }
    const p = await Notification.requestPermission();
    alert(p === "granted" ? t("gib.enabled") : t("gib.denied"));
  }

  if (!s.deadline) return null;

  if (s.done) return null;

  const hot = s.urgent || s.overdue;
  return (
    <div className={`animate-pulse rounded-2xl border-2 p-4 ${hot ? "border-red-600 bg-red-50 dark:border-red-600 dark:bg-red-950/30" : "border-amber-300 bg-amber-50 dark:border-red-950 dark:bg-neutral-950"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("gib.signon")}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${hot ? "bg-red-700" : "bg-stone-500"}`}>
          {s.overdue ? t("gib.overdue") : t("gib.daysLeft").replace("{n}", String(s.daysLeft))}
        </span>
        <a href={GIBS_URL} target="_blank" rel="noreferrer" className="font-bold underline">
          {t("gib.upload")}
        </a>
        <span className="text-sm font-bold">{t("gib.deadline").replace("{x}", formatDate(s.deadline))}</span>
        <span className="ml-auto flex gap-2">
          <button onClick={enableAlerts} className="rounded-full border px-3 py-1 text-xs font-bold">{t("gib.enable")}</button>
          <button onClick={() => markDone(true)} className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 dark:bg-red-600 dark:text-white">{t("gib.mark")}</button>
        </span>
      </div>
    </div>
  );
}
