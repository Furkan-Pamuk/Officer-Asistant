"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useActiveContract } from "@/hooks/useActiveContract";
import dynamic from "next/dynamic";

const ShipMap = dynamic(() => import("@/components/ShipMap"), { ssr: false });
import SeaStateOverlay from "@/components/SeaStateOverlay";

const POS_KEY = "oa-pos";
const AIS_KEY = "oa-ais-cache";

interface Ais {
  name: string; latitude: string; longitude: string; speed: string; course: string;
  destination: string; navigationalStatus: string; positionReceived: string; updateTime: string;
  at: string;
}

// Live AIS comes from DataDocked through our server route (key stays in .env).
// GPS/manual position remains as fallback. Each lookup costs 1 API credit.
export default function VesselTracker() {
  const { contract } = useActiveContract();
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [editing, setEditing] = useState(false);
  const [voy, setVoy] = useState({ depPort: "", destPort: "", eta: "", navStatus: "" });
  const [ais, setAis] = useState<Ais | null>(null);
  const [aisNote, setAisNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const { lat: la, lon: lo } = JSON.parse(raw);
        setLat(String(la)); setLon(String(lo));
      }
      const cached = localStorage.getItem(AIS_KEY);
      if (cached) setAis(JSON.parse(cached));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (contract) setVoy({ depPort: contract.depPort ?? "", destPort: contract.destPort ?? "", eta: contract.eta ?? "", navStatus: contract.navStatus ?? "" });
  }, [contract?.id]);

  async function liveAis() {
    const imo = contract?.imo?.replace(/\D/g, "");
    if (!imo) { setAisNote("Add the IMO number to this contract first."); return; }
    setLoading(true); setAisNote("");
    try {
      const r = await fetch(`/api/vessel/location?imo=${imo}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "lookup failed");
      const hit: Ais = { ...data, at: new Date().toISOString() };
      localStorage.setItem(AIS_KEY, JSON.stringify(hit));
      setAis(hit);
    } catch (e) {
      setAisNote(e instanceof Error ? e.message : "lookup failed");
    } finally { setLoading(false); }
  }

  const ala = parseFloat(ais?.latitude ?? ""), alo = parseFloat(ais?.longitude ?? "");
  const useAisPos = isFinite(ala) && isFinite(alo);
  const cla = useAisPos ? ala : parseFloat(lat), clo = useAisPos ? alo : parseFloat(lon);
  const valid = isFinite(cla) && isFinite(clo) && Math.abs(cla) <= 90 && Math.abs(clo) <= 180;

  async function locate() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
        setLat(String(p.coords.latitude)); setLon(String(p.coords.longitude));
      },
      () => {},
      { timeout: 15000 }
    );
  }

  async function saveVoy() {
    if (!contract) return;
    await db.contracts.update(contract.id, { ...voy, updatedAt: new Date().toISOString() });
    setEditing(false);
  }

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black">🛰️ {contract ? contract.shipName : "Vessel"} — live position</h2>
        <div className="flex gap-2 text-xs">
          <button onClick={liveAis} disabled={loading} className="rounded-full bg-emerald-500 px-3 py-1 font-black text-white disabled:opacity-50">
            {loading ? "…" : "🔴 Live AIS (1 credit)"}
          </button>
          <button onClick={locate} className="rounded-full bg-amber-400 px-3 py-1 font-black text-stone-950 dark:bg-red-600 dark:text-white">📍 GPS</button>
          <button onClick={() => setEditing(!editing)} className="rounded-full border border-white/30 px-3 py-1 font-bold">✏️ Voyage</button>
        </div>
      </div>
      {aisNote && <p className="mt-1 text-xs font-bold text-red-300">{aisNote}</p>}
      {valid ? (
        <div className="relative mt-2">
          <ShipMap key={`${cla.toFixed(3)}:${clo.toFixed(3)}`} lat={cla} lon={clo} label={contract?.shipName ?? "Vessel"} />
          <SeaStateOverlay lat={cla} lon={clo} ais={ais} />
          <button onClick={() => { setLat(""); setLon(""); setTimeout(() => { try { const raw = localStorage.getItem(POS_KEY); if (raw) { const { lat: la, lon: lo } = JSON.parse(raw); setLat(String(la)); setLon(String(lo)); } } catch {} }, 50); }} title="Reload map" className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-stone-900">↻</button>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-white/10 p-4 text-sm">
          <p className="font-bold">No position yet — enter the IMO and tap Live AIS, or use GPS.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Lat e.g. 41.03" inputMode="decimal" className="w-36 rounded-xl border px-2 py-1 text-sm text-stone-900" />
            <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Lon e.g. 28.97" inputMode="decimal" className="w-36 rounded-xl border px-2 py-1 text-sm text-stone-900" />
          </div>
        </div>
      )}
      {editing && contract ? (
        <div className="mt-2 grid gap-2 text-sm md:grid-cols-4">
          <input value={voy.depPort} onChange={(e) => setVoy({ ...voy, depPort: e.target.value })} placeholder="Departure port" className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <input value={voy.destPort} onChange={(e) => setVoy({ ...voy, destPort: e.target.value })} placeholder="Destination port" className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <input type="date" value={voy.eta} onChange={(e) => setVoy({ ...voy, eta: e.target.value })} className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <select value={voy.navStatus} onChange={(e) => setVoy({ ...voy, navStatus: e.target.value })} className="rounded-xl border px-2 py-1.5 text-stone-900">
            <option value="">Status…</option>
            <option value="underway">Underway</option>
            <option value="at-anchor">At anchor</option>
            <option value="in-port">In port</option>
          </select>
          <button onClick={saveVoy} className="rounded-full bg-amber-400 px-3 py-1.5 font-black text-stone-950 md:col-span-4">Save voyage</button>
        </div>
      ) : null}
      <p className="mt-1 text-[11px] opacity-60">Live AIS: DataDocked (1 credit/lookup). Map: OpenStreetMap.{ais?.updateTime || ais?.positionReceived ? ` Last update: ${ais!.updateTime || ais!.positionReceived}.` : ""}</p>
    </div>
  );
}
