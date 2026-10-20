"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIBRARY_BOOKS } from "@/lib/data";
import { KNOTS } from "@/lib/navigation-documents";
import { KnotFigure } from "@/components/KnotDiagrams";

type Tab = "pub" | "books" | "knots";

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
      if (t === "pub" || t === "books" || t === "knots") setTab(t);
    } catch { /* ignore */ }
  }, []);
  function pick(t: Tab) {
    setTab(t);
    router.replace(t === "pub" ? "/library" : `/library?tab=${t}`, { scroll: false });
  }
  function goDoc(tab: string) {
    router.push(tab === "orders" ? "/documents" : `/documents?tab=${tab}`);
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
        <button onClick={() => pick("books")} className={btn("books", "📕 Books")}>📕 Books ({LIBRARY_BOOKS.length})</button>
        <button onClick={() => pick("knots")} className={btn("knots", "🪢 Knots")}>🪢 Knots ({KNOTS.length})</button>
        {DOC_TABS.map((d) => (
          <button key={d.tab} onClick={() => goDoc(d.tab)} className="min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold opacity-70 hover:opacity-100">{d.label}</button>
        ))}
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
      ) : tab === "knots" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {KNOTS.map((k) => (
            <div key={k.id} className="rounded-2xl border bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="shrink-0 rounded-lg bg-white p-1 ring-1 ring-amber-200 dark:bg-neutral-900 print:ring-black"><KnotFigure id={k.id} /></span>
                <div>
                  <h2 className="font-semibold">{k.name}{k.tr ? <span className="ml-2 text-sm font-normal opacity-60">({k.tr})</span> : null}</h2>
                  <p className="mt-1 text-sm text-slate-600">{k.uses}</p>
                </div>
              </div>
              {k.warning && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">⚠️ {k.warning}</p>}
              <ol className="mt-2 grid gap-1.5">
                {k.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
                    <span className="font-black">{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
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
