"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIBRARY_BOOKS, USEFUL_LINKS } from "@/lib/data";

type Tab = "pub" | "links";

export default function Library() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pub");
  // Tab from URL, read client-side so nothing suspends during render.
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "links" || t === "pub") setTab(t);
    } catch { /* ignore */ }
  }, []);
  function pick(t: Tab) {
    setTab(t);
    router.replace(t === "pub" ? "/library" : "/library?tab=links", { scroll: false });
  }
  const groups = ["Official", "Vetting & PSC", "Welfare", "Tools"] as const;
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
        <button onClick={() => pick("links")} className={btn("links", "🔗 Useful links")}>🔗 Useful links ({USEFUL_LINKS.length})</button>
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
      ) : (
        <div className="grid gap-4">
          {groups.map((g) => (
            <div key={g}>
              <h2 className="text-sm font-black tracking-widest opacity-60">{g.toUpperCase()}</h2>
              <div className="mt-1 grid gap-3 md:grid-cols-2">
                {USEFUL_LINKS.filter((l) => l.group === g).map((l) => (
                  <div key={l.id} className="rounded-2xl border bg-white p-4">
                    <h3 className="font-semibold">{l.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{l.desc}</p>
                    <a href={l.url} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">Open link ↗</a>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs opacity-60">Public sources only — check on-board publications for the controlling text.</p>
        </div>
      )}
    </div>
  );
}
