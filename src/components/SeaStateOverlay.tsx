"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

export interface AisInfo {
  name: string;
  latitude: string;
  longitude: string;
  speed: string;
  course: string;
  destination: string;
  navigationalStatus: string;
  updateTime: string;
  positionReceived: string;
}

interface Sea {
  waveH: number; waveDir: number; swellH: number; swellDir: number;
  windKn: number; windDir: number; visKm: number | null; sky: string;
}

function skyLabel(code: number): string {
  if (code === 0) return "clear";
  if (code <= 3) return "partly cloudy";
  if (code <= 48) return "foggy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snowy";
  if (code <= 82) return "showers";
  return "stormy";
}

function douglas(h: number): string {
  if (h < 0.1) return "0 calm";
  if (h < 0.5) return "1–2 smooth";
  if (h < 1.25) return "3 slight";
  if (h < 2.5) return "4 moderate";
  if (h < 4) return "5 rough";
  if (h < 6) return "6 v.rough";
  if (h < 9) return "7 high";
  if (h < 14) return "8 v.high";
  return "9 phenom.";
}

function beaufort(kn: number): string {
  const t: [number, string][] = [
    [1, "0 calm"], [4, "1 light air"], [7, "2 light breeze"], [11, "3 gentle"],
    [17, "4 moderate"], [22, "5 fresh"], [28, "6 strong"], [34, "7 near gale"],
    [41, "8 gale"], [48, "9 severe gale"], [56, "10 storm"], [64, "11 violent storm"],
  ];
  for (const [lim, label] of t) if (kn < lim) return label;
  return "12 hurricane";
}

// Journal visibility code 0–9 (fog → excellent) from km.
function visCode(km: number | null): string {
  if (km === null) return "—";
  if (km < 0.05) return "0 dense fog";
  if (km < 0.2) return "1 thick fog";
  if (km < 0.5) return "2 fog";
  if (km < 1) return "3 mod. fog";
  if (km < 2) return "4 mist";
  if (km < 4) return "5 poor";
  if (km < 10) return "6 moderate";
  if (km < 20) return "7 good";
  if (km < 50) return "8 v.good";
  return "9 excellent";
}

function compass(deg: number) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(deg / 45) % 8];
}

// Full-height left rail on the map: AIS vessel block on top,
// live sea/weather block below (true-mode wind rose included).
export default function SeaStateOverlay({ lat, lon, ais }: { lat: number; lon: number; ais: AisInfo | null }) {
  const { t } = useLocale();
  const [sea, setSea] = useState<Sea | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [m, w] = await Promise.all([
          fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,swell_wave_height,swell_wave_direction&timezone=auto`).then((r) => { if (!r.ok) throw 0; return r.json(); }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m,weather_code&hourly=visibility&forecast_days=2&wind_speed_unit=kn&timezone=auto`).then((r) => { if (!r.ok) throw 0; return r.json(); }),
        ]);
        if (!alive) return;
        let vis: number | null = null;
        try {
          const times: string[] = w.hourly.time;
          const cur: string = w.current.time.slice(0, 13);
          const i = times.findIndex((t) => t.slice(0, 13) === cur);
          if (i >= 0) vis = Math.round((w.hourly.visibility[i] / 1000) * 10) / 10;
        } catch { /* ignore */ }
        setSea({
          waveH: m.current.wave_height, waveDir: m.current.wave_direction,
          swellH: m.current.swell_wave_height, swellDir: m.current.swell_wave_direction,
          windKn: w.current.wind_speed_10m, windDir: w.current.wind_direction_10m, visKm: vis,
          sky: skyLabel(w.current.weather_code ?? 0),
        });
      } catch { /* offline — stays hidden */ }
    }
    load();
    const t = setInterval(load, 15 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, [lat, lon]);

  return (
    <>
      <div className="absolute left-2 top-2 z-10 w-40 rounded-2xl bg-black/70 p-2 text-white backdrop-blur">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("ss.title")}</div>
      {sea ? (
        <div className="mt-1">
          <div className="flex items-center gap-1.5">
            <svg width="36" height="36" viewBox="0 0 44 44" style={{ transform: `rotate(${sea.windDir}deg)` }}>
              <circle cx="22" cy="22" r="20" fill="rgba(255,255,255,0.12)" />
              <text x="22" y="10" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">N</text>
              <path d="M22 12 L27 30 L22 26 L17 30 Z" fill="#fbbf24" />
            </svg>
            <div>
              <div className="text-base font-black leading-none">{Math.round(sea.windKn)}<span className="text-[10px]"> kn</span></div>
              <div className="text-[10px] opacity-80">{compass(sea.windDir)} true</div>
            </div>
          </div>
          <div className="mt-0.5 text-[11px] font-bold">Bft {beaufort(sea.windKn)}</div>
          <div className="mt-0.5 text-[11px]">
            <div>☁️ {sea.sky}</div>
            <div>🌊 {sea.waveH.toFixed(1)} m {compass(sea.waveDir)}</div>
            <div className="opacity-80">swell {sea.swellH.toFixed(1)} m</div>
            <div className="opacity-80">sea {douglas(sea.waveH)}</div>
            <div className="opacity-80">👁️ {sea.visKm === null ? "—" : `${sea.visKm} km`} <strong>code {visCode(sea.visKm)}</strong></div>
          </div>
        </div>
      ) : (
        <div className="mt-1 text-[11px] opacity-70">{t("ss.loading")}</div>
      )}
    </div>
    {ais && (
      <div className="absolute right-2 top-2 z-10 w-44 rounded-2xl bg-black/70 p-2 text-white backdrop-blur">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">AIS</div>
        <div className="text-xs font-black">{ais.speed} kn / {ais.course}°</div>
        <div className="truncate text-[11px]">{ais.navigationalStatus}</div>
        <div className="truncate text-[11px]">→ {ais.destination || "—"}</div>
      </div>
    )}
    </>
  );
}
