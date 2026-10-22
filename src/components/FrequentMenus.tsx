"use client";
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

function Inner() {
  const { t } = useLocale();
  const LABELS: Record<string, string> = {
    "/dashboard": t("fm.dash"), "/inspections": t("fm.insp"),
    "/checklists": t("fm.chk"), "/notes": t("dashboard.notes"), "/requests": t("fm.req"),
    "/menu": t("fm.menu"), "/contracts": t("fm.contracts"), "/library": t("fm.library"),
    "/news": t("fm.news"), "/contact": t("fm.contact"), "/profile?tab=settings": t("profile.tabSettings"),
    "/pricing": t("fm.pricing"), "/crew-accounts": t("fm.crew"),
  };
  const path = usePathname();
  const [top, setTop] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("oa-visits");
      const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
      if (path && path !== "/") {
        const base = "/" + path.split("/").filter(Boolean).slice(0, 1).join("/");
        counts[base] = (counts[base] ?? 0) + 1;
        localStorage.setItem("oa-visits", JSON.stringify(counts));
      }
      setTop(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p]) => p));
    } catch { /* ignore */ }
  }, [path]);

  if (top.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950">
      <div className="text-xs font-black uppercase tracking-widest opacity-60">{t("fm.frequent")}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {top.filter((p) => LABELS[p]).map((p) => (
          <Link key={p} href={p} className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold dark:bg-red-950 dark:text-red-200">
            {LABELS[p]}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function FrequentMenus() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
