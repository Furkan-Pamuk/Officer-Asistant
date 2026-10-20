"use client";
import { useEffect, useState } from "react";

interface Sun {
  sunrise: string;
  sunset: string;
}

// Approximate moon phase (Conway-ish): days since a known new moon.
function moonPhase(now: Date) {
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
  const days = now.getTime() / 86400000 - ref;
  const age = ((days % 29.530588853) + 29.530588853) % 29.530588853;
  const illum = Math.round(((1 - Math.cos((2 * Math.PI * age) / 29.530588853)) / 2) * 100);
  const idx = Math.floor(((age + 1.84566) % 29.53) / 3.69133 + 8) % 8;
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const emoji = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌘", "🌗", "🌘"];
  return { name: names[idx], emoji: emoji[idx], illum };
}

function hm(iso: string) {
  return iso.slice(11, 16);
}

export default function SunMoonCard() {
  const [sun, setSun] = useState<Sun | null>(null);
  const [phase, setPhase] = useState({ name: "Moon", emoji: "🌙", illum: 0 });

  useEffect(() => {
    setPhase(moonPhase(new Date()));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("oa-pos") ?? localStorage.getItem("oa-wx-cache");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const lat = parsed.lat ?? parsed.latitude;
      const lon = parsed.lon ?? parsed.longitude;
      if (!isFinite(lat) || !isFinite(lon)) return;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&forecast_days=1`)
        .then((r) => { if (!r.ok) throw 0; return r.json(); })
        .then((d) => setSun({ sunrise: d.daily.sunrise[0], sunset: d.daily.sunset[0] }))
        .catch(() => {});
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-stone-900 p-2.5 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <h2 className="text-sm font-black">☀️ Sun & Moon</h2>
      {sun ? (
        <div className="mt-1 flex items-center gap-2">
          <div className="text-xs font-bold">
            <div>🌅 Sunrise {hm(sun.sunrise)}</div>
            <div>🌇 Sunset {hm(sun.sunset)}</div>
          </div>
          <div className="ml-auto text-center">
            <div className="text-2xl">{phase.emoji}</div>
            <div className="text-[11px] font-bold">{phase.name} • {phase.illum}%</div>
          </div>
        </div>
      ) : (
        <div className="mt-1 text-center">
          <div className="text-2xl">{phase.emoji}</div>
          <div className="text-[11px] font-bold">{phase.name} • {phase.illum}%</div>
          <p className="mt-1 text-[11px] opacity-70">Set position for sunrise & sunset.</p>
        </div>
      )}
    </div>
  );
}
