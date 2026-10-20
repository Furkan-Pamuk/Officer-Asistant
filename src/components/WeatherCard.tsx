"use client";
import { useEffect, useRef, useState } from "react";

const POS_KEY = "oa-pos";
const WX_KEY = "oa-wx-cache";

interface DayF { date: string; max: number; min: number; code: number; prob: number }
interface Wx { temp: number; wind: number; precip: number; code: number; at: string; lat: number; lon: number; tz?: string; tzOffset?: number; local?: string; place?: string; daily?: DayF[] }

function icon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

export default function WeatherCard() {
  const [wx, setWx] = useState<Wx | null>(null);
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ name: string; country: string; admin1: string; latitude: number; longitude: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(lat: number, lon: number) {
    try {
      const [r, geo] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&wind_speed_unit=kn`).then((x) => { if (!x.ok) throw 0; return x.json(); }),
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then((x) => x.json()).catch(() => null),
      ]);
      const offH = Math.round((r.utc_offset_seconds as number) / 3600);
      const daily: DayF[] = (r.daily.time as string[]).slice(0, 7).map((d: string, i: number) => ({
        date: d, max: r.daily.temperature_2m_max[i], min: r.daily.temperature_2m_min[i],
        code: r.daily.weather_code[i], prob: r.daily.precipitation_probability_max[i] ?? 0,
      }));
      const place = geo ? [geo.city || geo.locality, geo.countryName].filter(Boolean).join(", ") : undefined;
      const w: Wx = { temp: r.current.temperature_2m, wind: r.current.wind_speed_10m, precip: r.current.precipitation, code: r.current.weather_code, at: r.current.time, lat, lon, tz: `UTC${offH >= 0 ? "+" : ""}${offH}`, tzOffset: offH, local: r.current.time.slice(11, 16), place, daily };
      localStorage.setItem(WX_KEY, JSON.stringify(w));
      setWx(w); setNote("");
    } catch {
      try {
        const raw = localStorage.getItem(WX_KEY);
        if (raw) { setWx(JSON.parse(raw)); setNote("cached/offline"); }
        else setNote("offline — no data yet");
      } catch { setNote("offline"); }
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WX_KEY);
      if (raw) setWx(JSON.parse(raw));
      const pos = localStorage.getItem(POS_KEY);
      if (pos) { const { lat, lon } = JSON.parse(pos); load(lat, lon); }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locate() {
    if (!("geolocation" in navigator)) { setNote("geolocation unavailable"); return; }
    setNote("locating…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        localStorage.setItem(POS_KEY, JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
        setResults([]);
        load(p.coords.latitude, p.coords.longitude);
      },
      () => setNote("location denied"),
      { timeout: 15000 }
    );
  }

  async function searchCity(query?: string) {
    const term = (query ?? q).trim();
    if (term.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=5&language=en&format=json`).then((x) => { if (!x.ok) throw 0; return x.json(); });
      // Letter-match ranking: prefer names starting with the typed text
      const s = term.toLowerCase();
      const list = (r.results ?? []).slice().sort((a: { name: string }, b: { name: string }) => {
        const an = a.name.toLowerCase().startsWith(s) ? 0 : 1;
        const bn = b.name.toLowerCase().startsWith(s) ? 0 : 1;
        return an - bn;
      });
      setResults(list);
      if (!list.length) setNote("no city found");
    } catch { setNote("search offline"); }
    finally { setSearching(false); }
  }

  function onType(v: string) {
    setQ(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (v.trim().length < 2) { setResults([]); return; }
    searchTimer.current = setTimeout(() => searchCity(v), 350);
  }

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-4 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black">🌦️ Weather on position</h2>
        <div className="flex items-center gap-1.5">
          <input value={q} onChange={(e) => onType(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") searchCity(); }} placeholder="Search city…" className="w-28 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-stone-900 placeholder:text-stone-400 dark:border-white/30 dark:bg-white/10 dark:text-white dark:placeholder:text-white/50" />
          <button onClick={() => searchCity()} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">🔍</button>
          <button onClick={locate} className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black text-stone-950 dark:bg-red-600 dark:text-white">📍 My location</button>
        </div>
      </div>
      {searching && <p className="mt-1 text-xs opacity-70">Searching…</p>}
      {results.length > 0 && (
        <div className="mt-1 grid gap-1">
          {results.map((r, i) => (
            <button key={i} onClick={() => { setResults([]); setQ(""); load(r.latitude, r.longitude); }} className="rounded-xl bg-white/10 px-2.5 py-1.5 text-left text-xs font-bold hover:bg-white/20">
              📍 {r.name}{r.admin1 ? `, ${r.admin1}` : ""}, {r.country}
            </button>
          ))}
        </div>
      )}
      {wx ? (
        <div className="mt-2 flex items-center gap-4">
          <span className="text-5xl">{icon(wx.code)}</span>
          <div className="text-3xl font-black">{Math.round(wx.temp)}°C</div>
          <div className="text-sm font-bold">
            <div>💨 {Math.round(wx.wind)} kn</div>
            <div>🌧️ {wx.precip} mm</div>
          </div>
          <div className="ml-auto text-right text-xs opacity-70">📍 {wx.place ?? `${wx.lat.toFixed(2)}, ${wx.lon.toFixed(2)}`}<br />{note || "live"}</div>
        </div>
      ) : (
        <p className="mt-2 text-sm opacity-70">{note || "Tap location to load weather — then cached offline."}</p>
      )}
      {wx?.daily && wx.daily.length > 0 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {wx.daily.map((d) => (
            <div key={d.date} className="min-w-16 flex-1 rounded-xl bg-white/10 px-2 py-1.5 text-center dark:bg-red-950/30">
              <div className="text-[11px] font-bold">{new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" })}</div>
              <div className="text-xl">{icon(d.code)}</div>
              <div className="text-xs font-black">{Math.round(d.max)}°/{Math.round(d.min)}°</div>
              <div className="text-[11px] opacity-70">🌧️ {d.prob}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
