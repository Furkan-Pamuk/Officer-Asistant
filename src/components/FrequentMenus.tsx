"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const LABELS: Record<string, string> = {
  "/dashboard": "🏠 Dashboard", "/inspections": "🧭 Inspections",
  "/checklists": "✅ Checklists", "/notes": "📝 Notes", "/requests": "📦 Requests",
  "/menu": "🍽️ Menu", "/contracts": "📄 Contracts", "/library": "📚 Library",
  "/news": "📰 News", "/contact": "✉️ Contact", "/profile?tab=settings": "⚙️ Settings",
  "/pricing": "💳 Pricing", "/crew-accounts": "💰 Crew Accounts",
};

function Inner() {
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
      <div className="text-xs font-black uppercase tracking-widest opacity-60">⚡ Frequent</div>
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
