"use client";
import { useOffline } from "next/offline";
import { useLocale } from "@/lib/i18n";

export default function OfflineBanner() {
  const isOffline = useOffline();
  const { t } = useLocale();
  if (!isOffline) return null;
  return (
    <div role="status" className="bg-amber-400 px-4 py-2 text-center text-sm font-bold text-stone-950 dark:bg-red-950 dark:text-red-200">
      {t("offline.msg")}
    </div>
  );
}
