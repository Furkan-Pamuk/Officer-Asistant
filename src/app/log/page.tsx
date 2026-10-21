"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { db, getActiveContractId, uid, exportJSON } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { INTERVALS, INT_KEY, RETENTIONS, RET_KEY, pruneLog, snapshotPosition } from "@/lib/logbook";
import { useAutoLog } from "@/lib/autolog";
import type { LogEntry } from "@/lib/types";

const POS_KEY = "oa-pos";

// Hourly deck log: auto position + wind/sea/visibility from the same
// sources as the tracker, manual compass/temperatures/variation.
export default function LogPage() {
  const [contractId, setContractId] = useState<string | null>(null);
  const rows = useLiveQuery(
    () => (contractId ? db.logEntries.where("contractId").equals(contractId).toArray() : Promise.resolve([] as LogEntry[])),
    [contractId]
  );
  const [f, setF] = useState({ compass: "", dryT: "", wetT: "", variation: "", note: "" });
  const { auto, setAuto } = useAutoLog();
  const [status, setStatus] = useState("");
  const [retention, setRetention] = useState("48h");
  const [interval, setIntervalV] = useState("1h");
  const watchRef = useRef<number | null>(null);

  useEffect(() => { setContractId(getActiveContractId()); }, []);
  useEffect(() => {
    try {
      setRetention(localStorage.getItem(RET_KEY) ?? "48h");
      setIntervalV(localStorage.getItem(INT_KEY) ?? "1h");
    } catch { /* ignore */ }
  }, []);

  // Prune entries older than the retention window
  useEffect(() => {
    if (contractId) pruneLog(contractId, retention);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, retention]);

  // Background-friendly position tracking while this page is open.
  // For true background logging, install the PWA and keep it open.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    try {
      watchRef.current = navigator.geolocation.watchPosition(
        (p) => {
          try {
            localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
          } catch { /* ignore */ }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 }
      );
    } catch { /* ignore */ }
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  async function logNow() {
    if (!contractId) return;
    setStatus("logging…");
    const s = await snapshotPosition();
    const now = new Date();
    await db.logEntries.add({
      id: uid("log"), contractId, time: now.toISOString(),
      lat: s.lat, lon: s.lon, tz: s.tz,
      compass: f.compass, windKn: s.windKn, windDir: s.windDir, waveM: s.waveM, visKm: s.visKm,
      dryT: f.dryT || s.dryT, wetT: f.wetT || s.wetT, variation: f.variation || s.variation, note: f.note, auto: false,
    });
    setStatus(`logged ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`);
  }

  // Phone compass (magnetometer): one-shot heading into the compass field.
  // iOS needs explicit permission; Android exposes alpha directly.
  async function phoneCompass() {
    try {
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") {
          setStatus("compass permission denied");
          return;
        }
      }
      setStatus("reading compass — hold the phone flat…");
      const h = await new Promise<number | null>((resolve) => {
        let done = false;
        const to = setTimeout(() => { if (!done) { done = true; window.removeEventListener("deviceorientation", onE); resolve(null); } }, 6000);
        function onE(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
          const v = e.webkitCompassHeading ?? (e.absolute === false ? null : e.alpha);
          if (v === null || v === undefined || !isFinite(v)) return;
          if (!done) {
            done = true;
            clearTimeout(to);
            window.removeEventListener("deviceorientation", onE);
            resolve(Math.round(((v % 360) + 360) % 360));
          }
        }
        window.addEventListener("deviceorientation", onE);
      });
      if (h === null) {
        setStatus("no compass sensor (or need HTTPS/location)");
      } else {
        setF((p) => ({ ...p, compass: String(h) }));
        setStatus(`compass ${h}° from phone`);
      }
    } catch {
      setStatus("compass not available on this device");
    }
  }

  // Auto log now runs globally (AutoLog engine) on every screen while the
  // app is open — this page only flips the persisted switch.
  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Deck Log</h1>
        <p className="text-sm">Select a contract first.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  const list = (rows ?? []).slice().sort((a, b) => b.time.localeCompare(a.time));

  function csv() {
    const head = "time_utc,lat,lon,tz,compass,wind_kn,wind_dir,wave_m,vis_km,dry_c,wet_c,variation,note";
    const lines = list.map((r) => [r.time, r.lat ?? "", r.lon ?? "", r.tz, r.compass, r.windKn, r.windDir, r.waveM, r.visKm, r.dryT, r.wetT, r.variation, `"${(r.note ?? "").replace(/"/g, "")}"`].join(","));
    const blob = new Blob([[head, ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "deck-log.csv";
    a.click();
  }

  const inp = "rounded-xl border px-2 py-1.5 text-sm w-full";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">📓 Deck Log — hourly</h1>
          <p className="text-sm opacity-70">Position, wind/sea/visibility, dry/wet bulb and variation auto-fill from GPS & open data in vessel timezone (typed values always win). Compass: type it or read the phone sensor. {status}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-xs font-bold">Keep
            <select value={retention} onChange={(e) => { setRetention(e.target.value); try { localStorage.setItem(RET_KEY, e.target.value); } catch {} if (contractId) pruneLog(contractId, e.target.value); }} className="rounded-xl border px-2 py-1.5 text-sm">
              {RETENTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1 text-xs font-bold">Auto every
            <select value={interval} onChange={(e) => { setIntervalV(e.target.value); try { localStorage.setItem(INT_KEY, e.target.value); } catch {} }} className="rounded-xl border px-2 py-1.5 text-sm">
              {INTERVALS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </label>
          <button onClick={() => setAuto(!auto)} className={`rounded-full px-4 py-2 text-sm font-bold ${auto ? "bg-emerald-600 text-white" : "border bg-white dark:bg-black"}`}>
            {auto ? "● Auto ON" : "○ Auto"}
          </button>
          <button onClick={() => exportJSON("deck-log.json", rows)} className="rounded-full border bg-white px-3 py-2 text-sm font-bold dark:bg-black">JSON</button>
          <button onClick={csv} className="rounded-full border bg-white px-3 py-2 text-sm font-bold dark:bg-black">CSV</button>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <div className="grid gap-2 text-sm md:grid-cols-4">
          <input value={f.compass} onChange={(e) => setF({ ...f, compass: e.target.value })} placeholder="Compass course °" inputMode="decimal" className={inp} />
          <input value={f.variation} onChange={(e) => setF({ ...f, variation: e.target.value })} placeholder="Variation E/W (from chart)" className={inp} />
          <input value={f.dryT} onChange={(e) => setF({ ...f, dryT: e.target.value })} placeholder="Dry bulb °C" inputMode="decimal" className={inp} />
          <input value={f.wetT} onChange={(e) => setF({ ...f, wetT: e.target.value })} placeholder="Wet bulb °C" inputMode="decimal" className={inp} />
        </div>
        <input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Note (optional)" className={`${inp} mt-2`} />
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={logNow} className="rounded-full bg-stone-900 px-5 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Log now</button>
          <button onClick={phoneCompass} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🧭 Phone compass</button>
        </div>
        <p className="mt-1 text-xs opacity-60">Allow location when asked — needed for lat/lon + timezone. Auto keeps logging on any screen while the app is open.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amber-200 dark:border-red-950">
        <table className="w-full min-w-[900px] border-collapse bg-white text-xs dark:bg-neutral-950">
          <thead>
            <tr className="bg-amber-100 text-left dark:bg-red-950">
              <th className="p-2">Time</th><th className="p-2">Lat/Lon</th><th className="p-2">Compass</th>
              <th className="p-2">Wind</th><th className="p-2">Sea m</th><th className="p-2">Vis km</th>
              <th className="p-2">Dry/Wet</th><th className="p-2">Var</th><th className="p-2">Note</th><th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t border-amber-100 dark:border-red-950">
                <td className="p-2 font-bold">{new Date(r.time).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}{r.tz ? ` ${r.tz}` : ""}{r.auto ? " •auto" : ""}</td>
                <td className="p-2">{r.lat !== null ? `${r.lat.toFixed(2)}, ${r.lon!.toFixed(2)}` : "—"}</td>
                <td className="p-2">{r.compass || "—"}</td>
                <td className="p-2">{r.windKn ? `${r.windKn}kn/${r.windDir}°` : "—"}</td>
                <td className="p-2">{r.waveM || "—"}</td>
                <td className="p-2">{r.visKm || "—"}</td>
                <td className="p-2">{r.dryT || r.wetT ? `${r.dryT || "—"}/${r.wetT || "—"}` : "—"}</td>
                <td className="p-2">{r.variation || "—"}</td>
                <td className="p-2">{r.note || ""}</td>
                <td className="p-2"><button onClick={() => db.logEntries.delete(r.id)} className="font-bold text-red-600">✕</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td className="p-3" colSpan={10}>No entries yet — fill the manual fields and Log now.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
