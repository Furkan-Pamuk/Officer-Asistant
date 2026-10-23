"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useActiveContract } from "@/hooks/useActiveContract";
import { useLocale } from "@/lib/i18n";
import dynamic from "next/dynamic";

const ShipMap = dynamic(() => import("@/components/ShipMap"), { ssr: false });
import SeaStateOverlay from "@/components/SeaStateOverlay";

const POS_KEY = "oa-pos";

interface Ais {
  name: string; mmsi?: string; latitude: string; longitude: string; speed: string; course: string;
  destination: string; navigationalStatus: string; positionReceived: string; updateTime: string;
  at: string;
}

// Live AIS comes from DataDocked through our server route (key stays in .env).
// GPS/manual position remains as fallback. Each lookup costs 1 API credit.
export default function VesselTracker() {
  const { t } = useLocale();
  const { contract } = useActiveContract();
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [editing, setEditing] = useState(false);
  const [voy, setVoy] = useState({ depPort: "", destPort: "", eta: "", navStatus: "" });
  const [cands, setCands] = useState<{ mmsi: string; name: string | null; seen: string | null }[]>([]);
  const [enr, setEnr] = useState<(Ais & { eta?: string }) | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [enrNote, setEnrNote] = useState("");
  const [enrAttr, setEnrAttr] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const { lat: la, lon: lo } = JSON.parse(raw);
        setLat(String(la)); setLon(String(lo));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (contract) setVoy({ depPort: contract.depPort ?? "", destPort: contract.destPort ?? "", eta: contract.eta ?? "", navStatus: contract.navStatus ?? "" });
  }, [contract?.id]);

  const cla = parseFloat(lat), clo = parseFloat(lon);
  const valid = isFinite(cla) && isFinite(clo) && Math.abs(cla) <= 90 && Math.abs(clo) <= 180;

  async function locate() {
    if (!("geolocation" in navigator)) return false;
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
          setLat(String(p.coords.latitude)); setLon(String(p.coords.longitude));
          resolve(true);
        },
        () => resolve(false),
        { timeout: 15000 }
      );
    });
  }

  // One-button sync: phone GPS for position + free AIS voyage data.
  // Contract is only touched via explicit Apply (AIS data can be stale).
  async function syncAll() {
    setEnriching(true); setEnrNote(""); setCands([]); setEnr(null); setEnrAttr("");
    await locate();
    try {
      if (contract?.mmsi && /^\d{9}$/.test(contract.mmsi)) {
        await pickCandidate(contract.mmsi, true);
        return;
      }
      const name = (contract?.shipName ?? "").trim();
      if (name.length < 2) throw new Error(t("vt.enrichName"));
      const r = await fetch(`/api/vessel/search?q=${encodeURIComponent(name)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "lookup failed");
      if (!data.candidates?.length) throw new Error(t("vt.noMatch"));
      if (data.candidates.length === 1) await pickCandidate(data.candidates[0].mmsi, true);
      else setCands(data.candidates);
    } catch (e) {
      setEnrNote(e instanceof Error ? e.message : "lookup failed");
    } finally { setEnriching(false); }
  }

  async function saveVoy() {
    if (!contract) return;
    await db.contracts.update(contract.id, { ...voy, updatedAt: new Date().toISOString() });
    setEditing(false);
  }

  async function pickCandidate(mmsi: string, silent?: boolean) {
    if (!silent) setEnriching(true);
    setEnrNote("");
    try {
      const r = await fetch(`/api/vessel/location?mmsi=${mmsi}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "lookup failed");
      setEnr({ ...data, at: new Date().toISOString() });
      setEnrAttr(typeof data.attribution === "string" ? data.attribution : "");
      setCands([]);
      if (contract && contract.mmsi !== mmsi) {
        await db.contracts.update(contract.id, { mmsi, updatedAt: new Date().toISOString() });
      }
    } catch (e) {
      setEnrNote(e instanceof Error ? e.message : "lookup failed");
    } finally { setEnriching(false); }
  }

  function parseEta(s: string): string {
    const m = s.match(/(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/);
    if (!m) return "";
    const now = new Date();
    let y = now.getFullYear();
    const dt = new Date(y, Number(m[1]) - 1, Number(m[2]));
    if (dt.getTime() < now.getTime() - 30 * 86400000) y += 1;
    return `${y}-${String(m[1]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
  }

  async function applyVoy() {
    if (!contract || !enr) return;
    const statusMap: Record<string, string> = { "Underway": "underway", "At anchor": "at-anchor", "Moored": "in-port" };
    await db.contracts.update(contract.id, {
      destPort: enr.destination || contract.destPort,
      eta: (enr as { eta?: string }).eta ? parseEta((enr as { eta?: string }).eta!) || contract.eta : contract.eta,
      navStatus: (enr.navigationalStatus && statusMap[enr.navigationalStatus]) || contract.navStatus,
      updatedAt: new Date().toISOString(),
    });
    setEnrNote(t("vt.applied"));
  }

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black">🛰️ {contract ? contract.shipName : "Vessel"} {t("vt.livePos")}</h2>
        <div className="flex gap-2 text-xs">
          <button onClick={syncAll} disabled={enriching} className="rounded-full bg-sky-500 px-3 py-1 font-black text-white disabled:opacity-50">
            {enriching ? "…" : t("vt.sync")}
          </button>
          <button onClick={() => setEditing(!editing)} className="rounded-full border border-white/30 px-3 py-1 font-bold">{t("vt.voyage")}</button>
        </div>
      </div>
      {enrNote && <p className="mt-1 text-xs font-bold text-sky-300">{enrNote}</p>}
      {cands.length > 0 && (
        <div className="mt-2 rounded-2xl bg-white/10 p-2 text-sm">
          <p className="px-1 text-xs font-bold opacity-80">{t("vt.pickVessel")}</p>
          {cands.map((c) => (
            <button key={c.mmsi} onClick={() => pickCandidate(c.mmsi)} className="mt-1 block w-full rounded-xl px-2 py-1.5 text-left font-bold hover:bg-white/10">
              {c.name ?? c.mmsi} <span className="font-medium opacity-60">· {c.mmsi}</span>
            </button>
          ))}
        </div>
      )}
      {enr && (
        <div className="mt-2 rounded-2xl bg-white/10 p-3 text-sm">
          <div className="font-black">{enr.name ?? "Vessel"} <span className="font-medium opacity-60">· {enr.mmsi}</span></div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-medium opacity-90">
            <span>{t("vt.dstPh")}: {enr.destination || "—"}</span>
            <span>ETA: {(enr as { eta?: string }).eta || "—"}</span>
            <span>{enr.navigationalStatus || ""}</span>
          </div>
          <button onClick={applyVoy} className="mt-2 rounded-full bg-sky-500 px-3 py-1 text-xs font-black text-white">{t("vt.applyVoy")}</button>
          {enrAttr ? <p className="mt-1 text-[10px] opacity-60">{enrAttr}</p> : null}
        </div>
      )}
      {valid ? (
        <div className="relative mt-2">
          <ShipMap key={`${cla.toFixed(3)}:${clo.toFixed(3)}`} lat={cla} lon={clo} label={contract?.shipName ?? "Vessel"} />
          <SeaStateOverlay lat={cla} lon={clo} ais={enr} />
          <button onClick={() => { setLat(""); setLon(""); setTimeout(() => { try { const raw = localStorage.getItem(POS_KEY); if (raw) { const { lat: la, lon: lo } = JSON.parse(raw); setLat(String(la)); setLon(String(lo)); } } catch {} }, 50); }} title={t("vt.reload")} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-stone-900">↻</button>
        </div>
      ) : (
        <div className="mt-2 rounded-2xl bg-white/10 p-4 text-sm">
          <p className="font-bold">{t("vt.noPos")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Lat e.g. 41.03" inputMode="decimal" className="w-36 rounded-xl border px-2 py-1 text-sm text-stone-900" />
            <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="Lon e.g. 28.97" inputMode="decimal" className="w-36 rounded-xl border px-2 py-1 text-sm text-stone-900" />
          </div>
        </div>
      )}
      {editing && contract ? (
        <div className="mt-2 grid gap-2 text-sm md:grid-cols-4">
          <input value={voy.depPort} onChange={(e) => setVoy({ ...voy, depPort: e.target.value })} placeholder={t("vt.depPh")} className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <input value={voy.destPort} onChange={(e) => setVoy({ ...voy, destPort: e.target.value })} placeholder={t("vt.dstPh")} className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <input type="date" value={voy.eta} onChange={(e) => setVoy({ ...voy, eta: e.target.value })} className="rounded-xl border px-2 py-1.5 text-stone-900" />
          <select value={voy.navStatus} onChange={(e) => setVoy({ ...voy, navStatus: e.target.value })} className="rounded-xl border px-2 py-1.5 text-stone-900">
            <option value="">{t("vt.statusPh")}</option>
            <option value="underway">Underway</option>
            <option value="at-anchor">At anchor</option>
            <option value="in-port">In port</option>
          </select>
          <button onClick={saveVoy} className="rounded-full bg-amber-400 px-3 py-1.5 font-black text-stone-950 md:col-span-4">{t("vt.saveVoy")}</button>
        </div>
      ) : null}
      <p className="mt-1 text-[11px] opacity-60">{t("vt.src")}{enr?.updateTime ? t("vt.lastUpd").replace("{x}", enr.updateTime) : ""} {t("vt.srcFree")}</p>
    </div>
  );
}
