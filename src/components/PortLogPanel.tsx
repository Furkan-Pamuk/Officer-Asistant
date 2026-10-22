"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, getActiveContractId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { detectStep, getCurrentPortCode, nearestPort } from "@/lib/portlog";
import { PORTS } from "@/lib/ports";
import StoryModal from "@/components/StoryModal";
import type { Voyage } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

const POS_KEY = "oa-pos";

// Automatic voyage legs: arriving in a port closes the open leg,
// leaving opens the next numbered voyage (Voyage 1, 2, …).
export default function PortLogPanel({ fromCode, toCode }: { fromCode?: string; toCode?: string }) {
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
  const { t } = useLocale();

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
    if (!p) { if (!silent) setMsg(t("plog.noPos")); return; }
    setMsg(await detectStep(contractId, p.lat, p.lon));
  }

  // Create story uses the route planner's two ports when provided (no
  // re-typing); otherwise falls back to the manual two-port maker.
  function createStory() {
    const a = (fromCode || "").trim();
    const b = (toCode || "").trim();
    if (a && b && a !== b && PORTS.some((p) => p.code === a) && PORTS.some((p) => p.code === b)) {
      setStoryVoy({ id: "manual", contractId: contractId!, no: 0, fromPort: "", fromCode: a, fromTime: "", toPort: "", toCode: b, toTime: "", status: "closed" });
      return;
    }
    setMFrom(a || "NLRTM");
    setMTo(b || "TRIST");
    setMaker(true);
  }

  function locate() {    if (!("geolocation" in navigator)) { setMsg(t("plog.noGeo")); return; }
    setMsg(t("plog.locating"));
    navigator.geolocation.getCurrentPosition(
      (p) => {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
        } catch { /* ignore */ }
        setMsg(t("plog.updated"));
        autoDetect(false);
      },
      () => setMsg(t("plog.denied")),
      { timeout: 15000 }
    );
  }

  if (!contractId) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("plog.titleShort")}</h1>
        <p className="text-sm">{t("common.needContract")}</p>
        <Link href="/contracts" className="w-fit rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50">{t("common.goContracts")}</Link>
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
          <h1 className="text-2xl font-bold">{t("plog.title")}</h1>
          <p className="text-sm opacity-70">
            {curName ? t("plog.atPort").replace("{n}", curName) : t("plog.atSea")} {msg}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={locate} className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-stone-950 dark:bg-red-600 dark:text-white">{t("plog.gps")}</button>
          <button onClick={() => autoDetect(false)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">{t("plog.detect")}</button>
          <button onClick={createStory} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">{t("plog.create")}</button>
        </div>
      </div>
      {maker && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-bold">{t("plog.maker")}</h2>
          <p className="text-xs opacity-70">{t("plog.makerHint")}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <select value={mFrom} onChange={(e) => setMFrom(e.target.value)} className="rounded-xl border px-3 py-2">
              {PORTS.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <select value={mTo} onChange={(e) => setMTo(e.target.value)} className="rounded-xl border px-3 py-2">
              {PORTS.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
            <button onClick={() => setMaker(false)} className="rounded-full border px-4 py-2 font-bold">{t("common.cancel")}</button>
            <button
              onClick={() => {
                if (mFrom === mTo) { setMsg(t("plog.pickTwo")); return; }
                setStoryVoy({ id: "manual", contractId: contractId!, no: 0, fromPort: "", fromCode: mFrom, fromTime: "", toPort: "", toCode: mTo, toTime: "", status: "closed" });
                setMaker(false);
              }}
              className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white"
            >
              {t("plog.preview")}
            </button>
          </div>
        </div>
      )}

      {openVoy && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-bold dark:border-red-800 dark:bg-red-950/20">
          {t("plog.openVoy").replace("{n}", String(openVoy.no)).replace("{f}", openVoy.fromPort).replace("{d}", openVoy.fromTime.slice(0, 10))}
        </div>
      )}

      <div className="grid gap-2">
        {sorted.filter((v) => v.status === "closed").slice().reverse().map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-white p-3 text-sm dark:border-red-950 dark:bg-neutral-950">
            <span className="rounded-full bg-stone-900 px-3 py-1 font-black text-amber-50 dark:bg-red-700 dark:text-white">{t("plog.voyN").replace("{n}", String(v.no))}</span>
            <strong className="flex-1">{v.fromPort} → {v.toPort}</strong>
            <span className="opacity-70">{v.fromTime.slice(0, 10)} → {v.toTime.slice(0, 10)}</span>
            {v.fromCode && v.toCode && (
              <button onClick={() => setStoryVoy(v)} className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-stone-950 dark:bg-red-600 dark:text-white">{t("route.story")}</button>
            )}
          </div>
        ))}
        {sorted.filter((v) => v.status === "closed").length === 0 && (
          <p className="text-sm opacity-70">{t("plog.empty")}</p>
        )}
      </div>
      <p className="text-xs opacity-60">{t("plog.radius")}</p>
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
