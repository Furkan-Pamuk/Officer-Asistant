"use client";
import { useState } from "react";
import Link from "next/link";
import { PRICING } from "@/lib/billing";
import { useLocale } from "@/lib/i18n";

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const { t } = useLocale();

  async function checkout(plan: string) {
    if (plan === "free") { alert(t("pricing.freeActive")); return; }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? t("pricing.noStripe"));
    } finally { setLoading(null); }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">{t("pricing.title")}</h1>
      <p className="text-sm text-slate-600">{t("pricing.sub")} <Link href="/faq" className="font-bold underline underline-offset-4">{t("pricing.faq")}</Link></p>
      <div className="grid gap-3 md:grid-cols-3">
        {PRICING.map((p) => (
          <div key={p.id} className="rounded-2xl border bg-white p-5">
            <div className="font-semibold">{p.name}</div>
            <div className="mt-1 text-3xl font-bold">{p.price}<span className="text-sm font-normal text-slate-500">{p.interval}</span></div>
            <ul className="mt-3 grid gap-1 text-sm text-slate-600">{p.features.map((f) => <li key={f}>• {f}</li>)}</ul>
            <button onClick={() => checkout(p.id)} disabled={loading === p.id} className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">
              {loading === p.id ? t("pricing.redirecting") : p.id === "free" ? t("pricing.useFree") : t("pricing.subscribe")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
