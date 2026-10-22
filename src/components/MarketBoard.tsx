"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

interface Quote { label: string; value: string; sub: string }

const CACHE_KEY = "oa-fx-cache";

async function fetchQuotes(): Promise<{ quotes: Quote[]; cached: boolean; at: string }> {
  const readCache = (): { quotes: Quote[]; at: string } | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  try {
    const [fx, cg] = await Promise.all([
      fetch("https://open.er-api.com/v6/latest/USD").then((r) => { if (!r.ok) throw 0; return r.json(); }),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd,try").then((r) => { if (!r.ok) throw 0; return r.json(); }),
    ]);
    const eur = fx.rates.EUR as number, gbp = fx.rates.GBP as number, try_ = fx.rates.TRY as number;
    const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
    const quotes: Quote[] = [
      { label: "USD / TRY", value: fmt(try_), sub: "dollar" },
      { label: "EUR / TRY", value: fmt(try_ / eur), sub: "euro" },
      { label: "GBP / TRY", value: fmt(try_ / gbp), sub: "sterlin" },
      { label: "EUR / USD", value: fmt(1 / eur, 4), sub: "parite" },
      { label: "Gold (gr) / TRY", value: fmt((cg["pax-gold"].usd / 31.1035) * try_, 0), sub: "≈ PAXG" },
      { label: "BTC / USD", value: "$" + fmt(cg.bitcoin.usd, 0), sub: "bitcoin" },
    ];
    const at = new Date().toISOString();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ quotes, at }));
    return { quotes, cached: false, at };
  } catch {
    const c = readCache();
    if (c) return { ...c, cached: true };
    throw new Error("offline");
  }
}

export default function MarketBoard() {
  const { t } = useLocale();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [meta, setMeta] = useState("");

  // Vessel-local time: reuse the offset cached by the weather card so both boards agree.
  function vesselStamp(iso: string) {
    try {
      const raw = localStorage.getItem("oa-wx-cache");
      if (raw) {
        const offH = Math.round((JSON.parse(raw).tzOffset ?? NaN) as number);
        if (isFinite(offH)) {
          const d = new Date(new Date(iso).getTime() + offH * 3600000);
          const p = (n: number) => String(n).padStart(2, "0");
          return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} UTC${offH >= 0 ? "+" : ""}${offH} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())} vessel time`;
        }
      }
    } catch { /* ignore */ }
    return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetchQuotes();
        if (!alive) return;
        setQuotes(r.quotes);
        setMeta(`${r.cached ? "cached " : ""}${vesselStamp(r.at)}`);
      } catch { if (alive) setMeta(t("mk.offline")); }
    }
    load();
    const timer = setInterval(load, 10 * 60 * 1000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex items-center justify-between">
        <h2 className="font-black tracking-wide">{t("mk.title")}</h2>
        <span className="text-xs text-white/60 dark:text-red-300/60">{meta}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quotes.map((q) => (
          <div key={q.label} className="rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10 dark:bg-red-950/30 dark:ring-red-900">
            <div className="text-[11px] uppercase tracking-wide text-white/60 dark:text-red-300/60">{q.label}</div>
            <div className="text-lg font-black text-[#2AA198] dark:text-red-200">{q.value}</div>
            <div className="text-[11px] text-white/40 dark:text-red-300/40">{q.sub}</div>
          </div>
        ))}
        {quotes.length === 0 && <p className="text-sm opacity-70">{t("mk.connect")}</p>}
      </div>
    </div>
  );
}
