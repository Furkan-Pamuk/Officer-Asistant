"use client";
import { useState } from "react";
import Link from "next/link";
import { db, getActiveContractId, uid, exportJSON } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import type { BellArchive, BellSide } from "@/lib/types";

const ENGINE_AHEAD = ["Full Ahead", "Half Ahead", "Slow Ahead", "Dead Slow Ahead"];
const ENGINE_ASTERN = ["Dead Slow Astern", "Slow Astern", "Half Astern", "Full Astern"];
const THRUSTER_STEPS = ["STEP 1", "STEP 2", "STEP 3"];

// From company bell-book minimum entries (arrival / departure / berth).
const EVENT_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Manoeuvring",
    items: ["1HR Notice to E/R", "E/R Standby (SBE)", "Master Has Conn", "OOW Has Conn", "Hand Steering On", "Hand Steering Off", "BNWAS On", "BNWAS Off", "Autopilot On", "FWE (Finished With Engines)"],
  },
  {
    title: "Anchor",
    items: ["Clear Away Anchor", "Heave Up Anchor (Start)", "Anchor Aweigh", "Let Go Anchor", "Anchor Housed"],
  },
  {
    title: "Pilot & Tugs",
    items: ["Pilot On Board", "Master/Pilot Exchange", "FWD Tug Made Fast", "FWD Tug Cast Off", "Aft Tug Made Fast", "Aft Tug Cast Off", "Pilot Away"],
  },
  {
    title: "Berth / Movement",
    items: ["Last Line Let Go", "Propeller Clear", "Start Swing to Port", "Start Swing to STBD", "Clear of Berth/Jetty"],
  },
];

function fmt(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function dms(lat: number, lon: number) {
  const f = (v: number, pos: string, neg: string) => {
    const a = Math.abs(v);
    let d = Math.floor(a);
    let m = Math.floor((a - d) * 60);
    let s = Math.round(((a - d) * 60 - m) * 60);
    if (s === 60) { s = 0; m++; }
    if (m === 60) { m = 0; d++; }
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d}°${p(m)}'${p(s)}"${v >= 0 ? pos : neg}`;
  };
  return `${f(lat, "N", "S")} ${f(lon, "E", "W")}`;
}

function readCachedPos(): { lat: number; lon: number } | null {
  try {
    const raw = localStorage.getItem("oa-pos");
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (isFinite(p.lat) && isFinite(p.lon)) return { lat: p.lat, lon: p.lon };
  } catch {
    /* ignore */
  }
  return null;
}

// Live GPS first (8s), then last known position, then nothing.
function readFix(): Promise<{ lat: number; lon: number; fresh: boolean } | null> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: { lat: number; lon: number; fresh: boolean } | null) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    const cached = () => {
      const c = readCachedPos();
      finish(c ? { ...c, fresh: false } : null);
    };
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => finish({ lat: p.coords.latitude, lon: p.coords.longitude, fresh: true }),
          () => cached(),
          { timeout: 8000, maximumAge: 60000 }
        );
        setTimeout(() => cached(), 9000);
      } else cached();
    } catch {
      cached();
    }
  });
}

export default function BellBookPage() {
  const [contractId] = useState<string | null>(() => getActiveContractId());
  const entries = useLiveQuery(
    () => (contractId ? db.bellLog.where("contractId").equals(contractId).toArray() : Promise.resolve([])),
    [contractId]
  );
  const archives = useLiveQuery(
    () => (contractId ? db.bellArchive.where("contractId").equals(contractId).toArray() : Promise.resolve([])),
    [contractId]
  );
  const [saveTitle, setSaveTitle] = useState("");
  const [openArchive, setOpenArchive] = useState<string | null>(null);

  async function record(side: BellSide, command: string) {
    if (!contractId) return;
    await db.bellLog.add({ id: uid("bell"), contractId, side, command, at: new Date().toISOString() });
  }

  async function recordEvent(command: string) {
    if (!contractId) return;
    const fix = await readFix();
    await db.bellLog.add({
      id: uid("bell"),
      contractId,
      side: "event",
      command,
      at: new Date().toISOString(),
      lat: fix?.lat ?? null,
      lon: fix?.lon ?? null,
      fix: fix ? (fix.fresh ? "gps" : "cached") : "none",
    });
  }

  function logText() {
    return log
      .map((e) => {
        const side = e.side === "engine" ? "ENGINE" : e.side === "event" ? "EVENT" : "THRUSTER";
        const pos = e.lat != null && e.lon != null ? ` @ ${dms(e.lat, e.lon)}` : "";
        return `${fmt(e.at)} — [${side}] ${e.command}${pos}`;
      })
      .join("\n");
  }

  function archiveText(a: BellArchive) {
    const rows = [...a.entries].sort((x, y) => x.at.localeCompare(y.at));
    return `🔔 BELL BOOK ARCHIVE — ${a.title}\nSaved: ${fmt(a.savedAt)} (${a.count} entries)\n\n` +
      rows
        .map((e) => {
          const side = e.side === "engine" ? "ENGINE" : e.side === "event" ? "EVENT" : "THRUSTER";
          const pos = e.lat != null && e.lon != null ? ` @ ${dms(e.lat, e.lon)}` : "";
          return `${fmt(e.at)} — [${side}] ${e.command}${pos}`;
        })
        .join("\n");
  }

  async function saveSnapshot() {
    if (!contractId || log.length === 0) return;
    const title = saveTitle.trim() || `Bell log ${fmt(new Date().toISOString()).slice(0, 16)}`;
    await db.bellArchive.add({
      id: uid("bellarc"),
      contractId,
      title,
      savedAt: new Date().toISOString(),
      count: log.length,
      entries: log.map((e) => ({ ...e })),
    });
    setSaveTitle("");
    if (window.confirm("Snapshot saved to archive. Clear the live log to start fresh?")) {
      await db.bellLog.where("contractId").equals(contractId).delete();
    }
  }

  async function shareArchive(a: BellArchive) {
    try {
      if (navigator.share) {
        await navigator.share({ title: `Bell Book — ${a.title}`, text: archiveText(a) });
        return;
      }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(archiveText(a));
        alert("Archive copied — paste it anywhere.");
      } catch {
        alert("Sharing not available here.");
      }
    }
  }

  async function restoreArchive(a: BellArchive) {
    if (!contractId) return;
    if (!window.confirm(`Replace the current live log with "${a.title}" (${a.count} entries)?`)) return;
    await db.bellLog.where("contractId").equals(contractId).delete();
    await db.bellLog.bulkAdd(a.entries.map((e) => ({ ...e })));
  }

  async function share() {
    const text = `🔔 BELL BOOK\n${logText()}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bell Book", text });
        return;
      }
      throw 0;
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        alert("Bell log copied — paste it anywhere.");
      } catch {
        alert("Sharing not available here.");
      }
    }
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">🔔 Bell Book</h1>
        <p className="text-sm">Select a contract first — bell orders are kept per vessel.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  const log = [...(entries ?? [])].sort((a, b) => b.at.localeCompare(a.at));

  const lastEngine = log.find((e) => e.side === "engine")?.command;
  // Legacy thruster rows have no Bow/Stern prefix (bow was the only panel) — count them as bow.
  const lastBowEntry = log.find((e) => e.command.startsWith("Bow ") || (e.side === "thruster" && !e.command.startsWith("Stern ")));
  const lastSternEntry = log.find((e) => e.command.startsWith("Stern "));
  const lastBow = lastBowEntry?.command.replace(/^Bow /, "");
  const lastStern = lastSternEntry?.command.replace(/^Stern /, "");
  const lastEvent = log.find((e) => e.side === "event");

  function StatusBox({ label, value, sub }: { label: string; value?: string; sub?: string }) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white px-3 py-2 dark:border-red-950 dark:bg-neutral-950">
        <p className="text-[11px] font-black tracking-widest opacity-60">{label}</p>
        <p className="truncate text-sm font-black">{value ?? "—"}</p>
        {sub && <p className="font-mono text-[11px] opacity-60">{sub}</p>}
      </div>
    );
  }

  const teleBtn =
    "w-full rounded-2xl border px-3 py-2.5 text-sm font-black transition active:scale-95";
  const ahead = `${teleBtn} border-emerald-700 bg-emerald-600 text-white dark:border-emerald-900`;
  const astern = `${teleBtn} border-red-700 bg-red-600 text-white dark:border-red-900`;
  const stop = `${teleBtn} border-2 border-red-600 bg-white py-3.5 text-base text-stone-950`;
  const port = `${teleBtn} border-red-700 bg-red-600 text-white dark:border-red-900`;
  const stbd = `${teleBtn} border-emerald-700 bg-emerald-600 text-white dark:border-emerald-900`;

  function ThrusterPanel({ title, tag }: { title: string; tag: "Bow" | "Stern" }) {
    return (
      <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
        <h2 className="text-center font-black tracking-wide">{title}</h2>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] gap-2 text-center text-xs font-black opacity-80">
          <span>◀ PORT</span>
          <span />
          <span>STBD ▶</span>
        </div>
        <div className="mt-1 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className="grid gap-2">
            {THRUSTER_STEPS.map((c) => (
              <button key={`p-${c}`} onClick={() => record("thruster", `${tag} Port ${c}`)} aria-label={`${tag} Port ${c}`} className={`${port}${(tag === "Bow" ? lastBow : lastStern) === `Port ${c}` ? " ring-4 ring-white/80" : ""}`}>{c}</button>
            ))}
          </div>
          <button onClick={() => record("thruster", `${tag} Stop`)} className={`${stop} self-center px-5${(tag === "Bow" ? lastBow : lastStern) === "Stop" ? " ring-4 ring-red-500" : ""}`}>■ STOP</button>
          <div className="grid gap-2">
            {THRUSTER_STEPS.map((c) => (
              <button key={`s-${c}`} onClick={() => record("thruster", `${tag} Starboard ${c}`)} aria-label={`${tag} Starboard ${c}`} className={`${stbd}${(tag === "Bow" ? lastBow : lastStern) === `Starboard ${c}` ? " ring-4 ring-white/80" : ""}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">🔔 Bell Book</h1>
          <p className="text-sm font-medium opacity-70">Tap an order — it is logged below with date and time.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => exportJSON(`bell-book-${contractId}.json`, { entries: log })}
            className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black"
          >
            Export
          </button>
          <button onClick={share} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">📤 Share</button>
          <button onClick={() => window.print()} className="rounded-full border bg-white px-3 py-1.5 text-sm font-bold dark:bg-black">🖨️ Print</button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <StatusBox label="🚢 ENGINE" value={lastEngine} sub={log.find((e) => e.side === "engine") ? fmt(log.find((e) => e.side === "engine")!.at) : undefined} />
        <StatusBox label="🌀 BOW" value={lastBow} sub={lastBowEntry ? fmt(lastBowEntry.at) : undefined} />
        <StatusBox label="🌀 STERN" value={lastStern} sub={lastSternEntry ? fmt(lastSternEntry.at) : undefined} />
        <StatusBox label="🧭 LAST EVENT" value={lastEvent?.command} sub={lastEvent ? fmt(lastEvent.at) : undefined} />
      </div>

      <div className="grid gap-4 print:hidden md:grid-cols-2 xl:grid-cols-3">
        <div className="grid content-start gap-4">
          <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
            <h2 className="text-center font-black tracking-wide">🚢 MAIN ENGINE</h2>
            <div className="mx-auto mt-3 grid w-full max-w-[240px] gap-2">
              {ENGINE_AHEAD.map((c) => (
                <button key={c} onClick={() => record("engine", c)} className={`${ahead}${lastEngine === c ? " ring-4 ring-white/80" : ""}`}>{c.toUpperCase()}</button>
              ))}
              <button onClick={() => record("engine", "Stop")} className={`${stop}${lastEngine === "Stop" ? " ring-4 ring-red-500" : ""}`}>■ STOP</button>
              {ENGINE_ASTERN.map((c) => (
                <button key={c} onClick={() => record("engine", c)} className={`${astern}${lastEngine === c ? " ring-4 ring-white/80" : ""}`}>{c.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <ThrusterPanel title="🌀 BOW THRUSTER" tag="Bow" />
          <ThrusterPanel title="🌀 STERN THRUSTER" tag="Stern" />
        </div>

        <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 md:col-span-2 xl:col-span-1 dark:border-red-800 dark:bg-black dark:text-red-200">
          <h2 className="text-center font-black tracking-wide">🧭 EVENTS LOGBOOK</h2>
          <p className="mt-1 text-center text-xs font-medium opacity-70">Tap = timestamp + GPS position (DMS).</p>
          {EVENT_GROUPS.map((g) => (
            <details key={g.title} className="mt-2 rounded-xl border border-white/20" open={g.title === "Manoeuvring"}>
              <summary className="cursor-pointer px-2 py-1.5 text-xs font-black tracking-widest opacity-80">{g.title.toUpperCase()}</summary>
              <div className="grid gap-1.5 px-2 pb-2">
                {g.items.map((it) => (
                  <button
                    key={it}
                    onClick={() => recordEvent(it)}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-2 py-1.5 text-left text-xs font-bold transition active:scale-95"
                  >
                    {it}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">📋 Bell log {log.length > 0 && <span className="opacity-60">({log.length})</span>}</h2>
        <div className="mt-2 flex flex-wrap gap-2 print:hidden">
          <input
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Archive title (e.g. Arrival Rotterdam)"
            className="min-w-52 flex-1 rounded-xl border px-3 py-1.5 text-sm"
          />
          <button
            onClick={saveSnapshot}
            disabled={log.length === 0}
            className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-amber-50 disabled:opacity-40 dark:bg-red-700 dark:text-white"
          >
            💾 Save snapshot
          </button>
        </div>
        {log.length === 0 ? (
          <p className="mt-2 text-sm opacity-70">No orders yet — tap a telegraph button above.</p>
        ) : (
          <ul className="mt-2 grid max-h-[55vh] gap-1 overflow-y-auto pr-1 text-sm">
            {log.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                <span className="rounded-full bg-stone-900 px-2 py-0.5 font-mono text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{fmt(e.at)}</span>
                <span className="rounded-full border px-2 py-0.5 text-xs font-bold">{e.side === "engine" ? "🚢 Engine" : e.side === "event" ? "🧭 Event" : "🌀 Thruster"}</span>
                <span className="flex-1 font-bold">{e.command}</span>
                <button onClick={() => db.bellLog.delete(e.id)} title="Delete entry" className="rounded-full border px-2 py-0.5 text-xs print:hidden">✕</button>
                {e.side === "event" && (
                  <span className="w-full font-mono text-[11px] opacity-70">
                    📍 {e.lat != null && e.lon != null ? `${dms(e.lat, e.lon)}${e.fix === "cached" ? " (last known)" : ""}` : "no fix"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">🗄️ Log archive {(archives?.length ?? 0) > 0 && <span className="opacity-60">({archives!.length})</span>}</h2>
        {(archives?.length ?? 0) === 0 ? (
          <p className="mt-1 text-sm opacity-70">No saved snapshots yet — save the live log above to archive it per voyage or manoeuvre.</p>
        ) : (
          <div className="mt-2 grid gap-2">
            {[...archives!].sort((a, b) => b.savedAt.localeCompare(a.savedAt)).map((a) => {
              const isOpen = openArchive === a.id;
              return (
                <div key={a.id} className="overflow-hidden rounded-xl border border-amber-200 dark:border-red-950">
                  <button onClick={() => setOpenArchive(isOpen ? null : a.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm">
                    <span className="flex-1">
                      <span className="block font-black">{a.title}</span>
                      <span className="block font-mono text-[11px] opacity-60">{fmt(a.savedAt)} • {a.count} entries</span>
                    </span>
                    <span className="font-black">{isOpen ? "▴" : "▾"}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-amber-200 p-2 dark:border-red-950">
                      <ul className="grid max-h-56 gap-1 overflow-y-auto text-sm">
                        {[...a.entries].sort((x, y) => b_cmp(x.at, y.at)).map((e) => (
                          <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-black">
                            <span className="rounded-full bg-stone-900 px-2 py-0.5 font-mono text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">{fmt(e.at)}</span>
                            <span className="rounded-full border px-2 py-0.5 text-xs font-bold">{e.side === "engine" ? "🚢 Engine" : e.side === "event" ? "🧭 Event" : "🌀 Thruster"}</span>
                            <span className="flex-1 font-bold">{e.command}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex flex-wrap gap-2 print:hidden">
                        <button onClick={() => exportJSON(`bell-archive-${a.id}.json`, { title: a.title, savedAt: a.savedAt, entries: a.entries })} className="rounded-full border px-3 py-1 text-xs font-bold">Export</button>
                        <button onClick={() => shareArchive(a)} className="rounded-full border px-3 py-1 text-xs font-bold">📤 Share</button>
                        <button onClick={() => restoreArchive(a)} className="rounded-full border px-3 py-1 text-xs font-bold">↩ Restore to live log</button>
                        <button onClick={() => { if (window.confirm(`Delete archive "${a.title}"?`)) db.bellArchive.delete(a.id); }} className="rounded-full border border-red-400 px-3 py-1 text-xs font-bold text-red-700">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function b_cmp(a: string, b: string) {
  return b.localeCompare(a);
}
