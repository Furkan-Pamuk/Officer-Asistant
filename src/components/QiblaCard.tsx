"use client";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n";

interface Prayers {
  Imsak: string;
  Maghrib: string;
  nextName: string;
  nextIn: string;
}

const KAABA = { lat: 21.4225, lon: 39.8262 };

function qibla(lat: number, lon: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLon = toRad(KAABA.lon - lon);
  const y = Math.sin(dLon);
  const x = Math.cos(toRad(lat)) * Math.tan(toRad(KAABA.lat)) - Math.sin(toRad(lat)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export default function QiblaCard() {
  const { t } = useLocale();
  const [data, setData] = useState<{ bearing: number; prayers: Prayers } | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const raw = localStorage.getItem("oa-pos");
        if (!raw) { setNote(t("qb.setPos")); return; }
        const { lat, lon } = JSON.parse(raw);
        if (!isFinite(lat) || !isFinite(lon)) return;
        const now = new Date();
        const stamp = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
        // method=13 → Diyanet (Türkiye)
        const r = await fetch(`https://api.aladhan.com/v1/timings/${stamp}?latitude=${lat}&longitude=${lon}&method=13`).then((x) => { if (!x.ok) throw 0; return x.json(); });
        if (!alive) return;
        const timings = r.data.timings;
        const order: [string, string][] = [["Imsak", timings.Imsak], ["Güneş", timings.Sunrise], ["Öğle", timings.Dhuhr], ["İkindi", timings.Asr], ["Akşam", timings.Maghrib], ["Yatsı", timings.Isha]];
        const hmNow = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        const upcoming = order.find(([n, v]) => v.slice(0, 5) >= hmNow && n !== "Güneş") ?? order[0];
        const [uh, um] = upcoming[1].slice(0, 5).split(":").map(Number);
        let mins = uh * 60 + um - (now.getHours() * 60 + now.getMinutes());
        if (mins < 0) mins += 1440;
        setData({
          bearing: Math.round(qibla(lat, lon)),
          prayers: {
            Imsak: timings.Imsak.slice(0, 5), Maghrib: timings.Maghrib.slice(0, 5),
            nextName: upcoming[0], nextIn: `${Math.floor(mins / 60)}h ${mins % 60}m`,
          },
        });
      } catch {
        if (alive) setNote(t("qb.offline"));
      }
    }
    load();
  }, []);

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-stone-900 p-2.5 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <h2 className="text-sm font-black">{t("qb.title")}</h2>
      {data ? (
        <div className="mt-1 flex items-center gap-2">
          <svg width="44" height="44" viewBox="0 0 64 64" style={{ transform: `rotate(${data.bearing}deg)` }}>
            <circle cx="32" cy="32" r="29" fill="rgba(255,255,255,0.1)" />
            <text x="32" y="13" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fff">N</text>
            <path d="M32 16 L38 44 L32 40 L26 44 Z" fill="#2AA198" />
          </svg>
          <div className="text-xs font-bold">
            <div>🧭 {data.bearing}°</div>
            <div>🌙 {data.prayers.Imsak} • 🌆 {data.prayers.Maghrib}</div>
            <div className="opacity-70">{data.prayers.nextName} in {data.prayers.nextIn}</div>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-xs opacity-70">{note || t("common.loading")}</p>
      )}
    </div>
  );
}
