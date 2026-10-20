"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, getActiveContractId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { detectStep, getCurrentPortCode, nearestPort } from "@/lib/portlog";
import { PORTS } from "@/lib/ports";
import StoryModal from "@/components/StoryModal";
import type { Voyage } from "@/lib/types";

const POS_KEY = "oa-pos";

// Automatic voyage legs: arriving in a port closes the open leg,
// leaving opens the next numbered voyage (Voyage 1, 2, …).
export default function PortLogPanel() {
  const [contractId, setContractId] = useState<string | null>(null);
  const voyages = useLiveQuery(
    () => (contractId ? db.voyages.where("contractId").equals(contractId).toArray() : Promise.resolve([] as Voyage[])),
    [contractId]
  );
  const [msg, setMsg] = useState("");
  const [where, setWhere] = useState("");
  const [storyVoy, setStoryVoy] = useState<Voyage | null>(null);
  const [maker, setMaker] = useState(false);
  const [mFrom, setMFrom] = useState("NLRTM");
  const [mTo, setMTo] = useState("TRIST");

  useEffect(() => { setContractId(getActiveContractId()); }, []);

  useEffect(() => {
    if (!contractId) return;
    const t = setInterval(() => autoDetect(), 5 * 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  function readPos(): { lat: number; lon: number } | null {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      if (!isFinite(p.lat) || !isFinite(p.lon)) return null;
      return p;
    } catch {
      return null;
    }
  }

  async function autoDetect(silent = true) {
    if (!contractId) return;
    const p = readPos();
    if (!p) { if (!silent) setMsg("No position yet — tap 📍 GPS first."); return; }
    setMsg(await detectStep(contractId, p.lat, p.lon));
  }

  function locate() {
    if (!("geolocation" in navigator)) { setMsg("Geolocation unavailable."); return; }
    setMsg("locating…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
        } catch { /* ignore */ }
        setMsg("Position updated — detecting…");
        autoDetect(false);
      },
      () => setMsg("Location denied."),
      { timeout: 15000 }
    );
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">Port Log</h1>
        <p className="text-sm">Select a contract first.</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">Go to contracts</Link>
      </div>
    );
  }

  const p = readPos();
  const near = p ? nearestPort(p.lat, p.lon) : null;
  const curCode = getCurrentPortCode(contractId);
  const curName = PORTS.find((x) => x.code === curCode)?.name ?? null;
  const sorted = (voyages ?? []).slice().sort((a, b) => a.no - b.no);
  const openVoy = sorted.find((v) => v.status === "open") ?? null;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">🗺️ Port Log — voyages</h1>
          <p className="text-sm opacity-70">
            {curName ? `Currently at ${curName}.` : "Currently at sea (or unknown)."} {msg}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={locate} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white">📍 GPS + detect</button>
          <button onClick={() => autoDetect(false)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">Detect now</button>
          <button onClick={() => setMaker(true)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">✨ Create story</button>
        </div>
      </div>
      {maker && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">✨ Voyage story maker</h2>
          <p className="text-xs opacity-70">Pick any two ports — no voyage needed (Strava-style).</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <select value={mFrom} onChange={(e) => setMFrom(e.target.value)} className="rounded-xl border px-3 py-2">
              {PORTS.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <select value={mTo} onChange={(e) => setMTo(e.target.value)} className="rounded-xl border px-3 py-2">
              {PORTS.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <button onClick={() => setMaker(false)} className="rounded-full border px-4 py-2 font-bold">Cancel</button>
            <button
              onClick={() => {
                if (mFrom === mTo) { setMsg("Pick two different ports."); return; }
                setStoryVoy({ id: "manual", contractId: contractId!, no: 0, fromPort: "", fromCode: mFrom, fromTime: "", toPort: "", toCode: mTo, toTime: "", status: "closed" });
                setMaker(false);
              }}
              className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white"
            >
              📸 Preview story
            </button>
          </div>
        </div>
      )}

      {openVoy && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-bold dark:border-red-800 dark:bg-red-950/20">
          🚢 Open: Voyage {openVoy.no} — {openVoy.fromPort} → … (since {openVoy.fromTime.slice(0, 10)})
        </div>
      )}

      <div className="grid gap-2">
        {sorted.filter((v) => v.status === "closed").slice().reverse().map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-white p-3 text-sm dark:border-red-950 dark:bg-neutral-950">
            <span className="rounded-full bg-stone-900 px-3 py-1 font-black text-amber-50 dark:bg-red-700 dark:text-white">Voyage {v.no}</span>
            <strong className="flex-1">{v.fromPort} → {v.toPort}</strong>
            <span className="opacity-70">{v.fromTime.slice(0, 10)} → {v.toTime.slice(0, 10)}</span>
            {v.fromCode && v.toCode && (
              <button onClick={() => setStoryVoy(v)} className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950 dark:bg-red-600 dark:text-white">📸 Story</button>
            )}
          </div>
        ))}
        {sorted.filter((v) => v.status === "closed").length === 0 && (
          <p className="text-sm opacity-70">No closed voyages yet. Arrive at a port to start — depart to open Voyage 1.</p>
        )}
      </div>
      <p className="text-xs opacity-60">Port detection radius 25 km around ~90 major ports. Keep GPS on; detection also runs every 5 min while this page is open.</p>
      {storyVoy && (
        <StoryModal
          fromCode={storyVoy.fromCode}
          toCode={storyVoy.toCode}
          fromTime={storyVoy.fromTime || undefined}
          toTime={storyVoy.toTime || undefined}
          onClose={() => setStoryVoy(null)}
        />
      )}
    </div>
  );
}
