"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIBRARY_BOOKS } from "@/lib/data";

type Tab = "pub" | "docs" | "books";

const DOC_TABS: { tab: string; label: string; desc: string }[] = [
  { tab: "orders", label: "📜 Orders", desc: "Master's standing orders + signature block." },
  { tab: "cards", label: "🆘 Cards", desc: "Emergency check cards with tickable steps." },
  { tab: "lights", label: "💡 Buoys", desc: "IALA buoyage, rhythms and light characters." },
  { tab: "symbols", label: "🧭 Symbols", desc: "Chart symbols, paper + ECDIS." },
  { tab: "weather", label: "⛅ Weather", desc: "Clouds, Beaufort, fronts and sea state." },
  { tab: "signals", label: "🚩 Signals", desc: "Phonetic alphabet + signal flags." },
  { tab: "morse", label: "📻 Morse", desc: "Morse code + procedure signs." },
  { tab: "colreg", label: "⚖️ COLREG", desc: "Rules of the road, lights, sounds, distress." },
];

export default function Library() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pub");
  // Tab from URL, read client-side so nothing suspends during render.
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "pub" || t === "docs" || t === "books") setTab(t);
    } catch { /* ignore */ }
  }, []);
  function pick(t: Tab) {
    setTab(t);
    router.replace(t === "pub" ? "/library" : `/library?tab=${t}`, { scroll: false });
  }
  const btn = (t: Tab, label: string) =>
    `min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === t ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`;
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">Library — sources & study material</h1>
        <p className="text-sm text-slate-600">Add the books behind each inspection. SIRE/CDI official texts are licensed — we link them and provide summary preparation cards.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
        <button onClick={() => pick("pub")} className={btn("pub", "📚 Publications")}>📚 Publications ({LIBRARY_BOOKS.length})</button>
        <button onClick={() => pick("docs")} className={btn("docs", "📑 Documents")}>📑 Documents ({DOC_TABS.length})</button>
        <button onClick={() => pick("books")} className={btn("books", "📕 Books")}>📕 Books ({LIBRARY_BOOKS.length})</button>
      </div>
      {tab === "pub" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {LIBRARY_BOOKS.map((b) => (
            <div key={b.id} className="rounded-2xl border bg-white p-4">
              <div className="text-xs font-bold text-sky-700">{b.abbr}</div>
              <h2 className="font-semibold">{b.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{b.description}</p>
              <p className="mt-1 text-xs text-slate-500">Used for: {b.inspections.join(", ")}</p>
              <a href={b.link} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">Open official source</a>
            </div>
          ))}
        </div>
      ) : tab === "docs" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {DOC_TABS.map((d) => (
            <a key={d.tab} href={d.tab === "orders" ? "/documents" : `/documents?tab=${d.tab}`} className="rounded-2xl border bg-white p-4 hover:shadow">
              <h2 className="font-semibold">{d.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{d.desc}</p>
            </a>
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {LIBRARY_BOOKS.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3">
              <div className="flex-1">
                <span className="text-xs font-bold text-sky-700">{b.abbr}</span>
                <h2 className="text-sm font-semibold">{b.title}</h2>
              </div>
              <a href={b.link} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">Open ↗</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
