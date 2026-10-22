"use client";
import { useEffect, useState } from "react";
import { sunAzimuth, sunTimesUTC, amplitude, compassError, eqOfTime } from "@/lib/celestial";
import { moonRADec, sunRADec, altAz, gmst, STARS } from "@/lib/almanac";
import { useLocale } from "@/lib/i18n";

function usePos() {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("oa-pos");
      if (raw) {
        const p = JSON.parse(raw);
        if (isFinite(p.lat) && isFinite(p.lon)) setPos({ lat: p.lat, lon: p.lon });
      }
    } catch { /* ignore */ }
  }, []);
  return pos;
}

// Celestial helpers — fully offline: live sun bearing/altitude,
// sunrise/sunset UTC cross-check and amplitude compass error.
export default function CelestialPage() {
  const { t } = useLocale();
  const pos = usePos();
  const [now, setNow] = useState<Date | null>(null);
  const [mode, setMode] = useState<"rising" | "setting">("rising");
  const [observed, setObserved] = useState("");

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!pos) {
    return (
      <div className="grid gap-3">
        <h1 className="text-2xl font-bold">{t("cel.title")}</h1>
        <p className="text-sm">{t("cel.needPos")}</p>
      </div>
    );
  }

  const sun = now ? sunAzimuth(pos.lat, pos.lon, now) : null;
  const times = sunTimesUTC(pos.lat, pos.lon, now ?? undefined);
  const amp = amplitude(pos.lat, mode, now ?? undefined);
  const obs = parseFloat(observed);
  const err = isFinite(obs) ? compassError(obs, amp) : null;
  const moon = now ? altAz(moonRADec(now).ra, moonRADec(now).dec, pos.lat, pos.lon, now) : null;
  const moonRD = now ? moonRADec(now) : null;
  const starRows = now
    ? STARS.map((s) => ({ ...s, ...altAz(s.raH * 15, s.dec, pos.lat, pos.lon, now) })).sort((a, b) => b.altitude - a.altitude)
    : [];

  const box = "rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950";

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("cel.title")}</h1>
        <p className="text-sm opacity-70">{t("cel.computed").replace("{a}", pos.lat.toFixed(2)).replace("{o}", pos.lon.toFixed(2))}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className={box}>
          <h2 className="font-black">{t("cel.sun")}</h2>
          <div className="mt-1 text-3xl font-black">{sun ? `${sun.azimuth}°` : "…"}</div>
          <div className="text-sm">{t("cel.alt").replace("{x}", sun ? String(sun.altitude) : "…")}</div>
          <div className="mt-1 text-xs opacity-60">{t("cel.bearingHint")}</div>
        </div>
        <div className={box}>
          <h2 className="font-black">{t("cel.riseSet")}</h2>
          <div className="mt-1 text-sm">{t("cel.rise").replace("{x}", times.sunriseUTC)}</div>
          <div className="text-sm">{t("cel.set").replace("{x}", times.sunsetUTC)}</div>
          <div className="text-sm">{t("cel.mer").replace("{x}", times.solarNoonUTC)}</div>
        </div>
        <div className={box}>
          <h2 className="font-black">{t("cel.amplitude")}</h2>
          <div className="mt-1 flex gap-2 text-sm">
            <button onClick={() => setMode("rising")} className={`rounded-full px-3 py-1 font-bold ${mode === "rising" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border"}`}>{t("cel.rising")}</button>
            <button onClick={() => setMode("setting")} className={`rounded-full px-3 py-1 font-bold ${mode === "setting" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border"}`}>{t("cel.setting")}</button>
          </div>
          <div className="mt-1 text-sm">{t("cel.compAmp").replace("{x}", String(amp))}</div>
          <input value={observed} onChange={(e) => setObserved(e.target.value)} placeholder={t("cel.obsPh")} inputMode="decimal" className="mt-1 w-full rounded-xl border px-2 py-1 text-sm" />
          {err !== null && <div className="mt-1 text-sm">{t("cel.err").replace("{x}", err > 0 ? `${err}°W` : err < 0 ? `${-err}°E` : "0°")}</div>}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={box}>
          <h2 className="font-black">{t("cel.moon")}</h2>
          <div className="mt-1 text-3xl font-black">{moon ? `${moon.azimuth}°` : "…"}</div>
          <div className="text-sm">{t("cel.alt").replace("{x}", moon ? String(moon.altitude) : "…")}</div>
          <div className="mt-1 text-xs opacity-60">{t("cel.gha").replace("{a}", moonRD ? String(Math.round(((gmst(now!) - moonRD.ra + 360) % 360) * 10) / 10) : "—").replace("{d}", moonRD ? moonRD.dec.toFixed(1) : "—")}</div>
        </div>
        <div className={box}>
          <h2 className="font-black">{t("cel.stars")}</h2>
          <ul className="mt-1 grid max-h-56 gap-1 overflow-y-auto text-sm">
            {starRows.map((s) => (
              <li key={s.name} className={`flex justify-between rounded-lg px-2 py-1 ${s.altitude > 0 ? "bg-amber-50 font-bold dark:bg-black dark:ring-1 dark:ring-red-950" : "opacity-50"}`}>
                <span>{s.name}{s.altitude > 0 ? " ●" : ""}</span>
                <span>Az {s.azimuth}° • Alt {s.altitude}°</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs opacity-60">{t("cel.above")}</p>
        </div>
      </div>

      <AlmanacPage pos={pos} />
    </div>
  );
}

function AlmanacPage({ pos }: { pos: { lat: number; lon: number } }) {
  const { t } = useLocale();
  const [day, setDay] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const base = new Date(day + "T00:00:00Z");
  const doy = Math.floor((Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()) - Date.UTC(base.getUTCFullYear(), 0, 0)) / 86400000);
  const eot = Math.round(eqOfTime(doy) * 10) / 10;
  const hours = [0, 6, 12, 18].map((h) => {
    const t = new Date(base.getTime() + h * 3600000);
    const sun = sunRADec(t);
    const moon = moonRADec(t);
    const g = gmst(t);
    return {
      h: `${String(h).padStart(2, "0")}:00`,
      sunGHA: Math.round((((g - sun.ra) % 360) + 360) % 360 * 10) / 10,
      sunDec: Math.round(sun.dec * 10) / 10,
      moonGHA: Math.round((((g - moon.ra) % 360) + 360) % 360 * 10) / 10,
      moonDec: Math.round(moon.dec * 10) / 10,
    };
  });
  const g0 = gmst(base);
  const box = "rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950";
  return (
    <div className={box}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-black">{t("cel.almanac")}</h2>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="ml-auto rounded-xl border px-2 py-1 text-sm" />
      </div>
      <p className="text-xs opacity-60">{t("cel.aries").replace("{a}", String(Math.round(g0 * 10) / 10)).replace("{e}", String(eot))}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-amber-100 text-left dark:bg-red-950">
              <th className="p-1.5">UT</th><th className="p-1.5">{t("cel.sunGha")}</th><th className="p-1.5">{t("cel.sunDec")}</th>
              <th className="p-1.5">{t("cel.moonGha")}</th><th className="p-1.5">{t("cel.moonDec")}</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((r) => (
              <tr key={r.h} className="border-t border-amber-100 dark:border-red-950">
                <td className="p-1.5 font-black">{r.h}</td>
                <td className="p-1.5">{r.sunGHA}°</td><td className="p-1.5">{r.sunDec}°</td>
                <td className="p-1.5">{r.moonGHA}°</td><td className="p-1.5">{r.moonDec}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
