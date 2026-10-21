"use client";

import { useMemo, useState } from "react";
import { LAND_RINGS } from "@/lib/world-land";

// Maritime security areas. World view is schematic; detail views draw the
// published IBF/UKMTO reference points where they exist and say so.
// Levels follow IBF/ITF designations reported around Mar–Oct 2026 and change
// often; exact limits are in UKHO chart Q6099 and the current IBF list.
export interface HraZone {
  n: number;
  name: string;
  level: "WOA" | "HRA" | "VRA";
  lon: number;
  lat: number;
  rx: number;
  ry: number;
  note: string;
}

export const HRA_ZONES: HraZone[] = [
  { n: 1, name: "Red Sea & Bab el-Mandeb", level: "WOA", lon: 42.5, lat: 18, rx: 5, ry: 9, note: "Yemen coast / Yemeni ports warlike area; transit corridor." },
  { n: 2, name: "Gulf of Aden & Somali Basin", level: "HRA", lon: 52, lat: 9, rx: 10, ry: 6, note: "Legacy piracy HRA core; heart of the UKMTO reporting area." },
  { n: 3, name: "Strait of Hormuz & approaches", level: "WOA", lon: 57, lat: 25.5, rx: 5, ry: 4, note: "Warlike designation (Mar 2026, weekly review); includes Gulf of Oman + Persian Gulf." },
  { n: 4, name: "Western Indian Ocean (offshore)", level: "VRA", lon: 63, lat: -3, rx: 9, ry: 10, note: "Voluntary Reporting Area offshore leg — report to UKMTO." },
  { n: 5, name: "Gulf of Guinea / West Africa", level: "HRA", lon: 2, lat: 1, rx: 9, ry: 6, note: "Lagos approaches, Luanda–Baía dos Tigres, Greenville–Sassandra legs per IBF papers." },
  { n: 6, name: "Black Sea", level: "WOA", lon: 34, lat: 43.5, rx: 7, ry: 3.5, note: "Warlike area (Ukraine war); check flag/coastal-state guidance too." },
  { n: 7, name: "Israel & Lebanon coastline", level: "WOA", lon: 35.3, lat: 33.2, rx: 2.5, ry: 2.5, note: "Warlike coastal designation; port calls need company clearance." },
];

const LEVEL_FILL: Record<HraZone["level"], string> = { WOA: "#dc2626", HRA: "#d97706", VRA: "#2AA198" };

const W = 720;
const H = 360;

type Region = "world" | "redsea" | "hormuz" | "blacksea" | "guinea";
const REGIONS: { id: Region; label: string; minLon: number; maxLon: number; minLat: number; maxLat: number; step: number }[] = [
  { id: "world", label: "🌍 World", minLon: -180, maxLon: 180, minLat: -90, maxLat: 90, step: 30 },
  { id: "redsea", label: "🔍 Red Sea detail", minLon: 32, maxLon: 60, minLat: 8, maxLat: 32, step: 4 },
  { id: "hormuz", label: "🔍 Hormuz detail", minLon: 53.5, maxLon: 60.5, minLat: 22.5, maxLat: 27.5, step: 1 },
  { id: "blacksea", label: "🔍 Black Sea", minLon: 27, maxLon: 42, minLat: 40.5, maxLat: 47, step: 2 },
  { id: "guinea", label: "🔍 Gulf of Guinea", minLon: -10, maxLon: 10, minLat: -6, maxLat: 6, step: 2 },
];

// Southern Red Sea HRA polygon corners (IBF Dec 2023: 16°24.12′N SA–YE
// border line west to Eritrea; south edge at Bab el-Mandeb TSS). Joins along
// coasts are schematic; the two labelled latitudes are the published ones.
const REDSEA_HRA: [number, number][] = [
  [39.0, 16.4], [42.9, 16.4], [43.7, 12.6], [42.9, 12.35], [40.5, 13.5],
];
// Yemeni south-coast leg (IBF Dec 2023): Aden 45°01.4′E south to IRTC 12°05′N,
// then west along the corridor to the war-zone limit.
const YEMEN_LEG: [number, number][] = [[45.02, 12.78], [45.02, 12.08], [43.6, 12.1]];

export default function HraMap() {
  const [region, setRegion] = useState<Region>("world");
  const R = REGIONS.find((r) => r.id === region)!;
  const X = (lon: number) => ((lon - R.minLon) / (R.maxLon - R.minLon)) * W;
  const Y = (lat: number) => ((R.maxLat - lat) / (R.maxLat - R.minLat)) * H;
  const land = useMemo(() => {
    let d = "";
    for (const ring of LAND_RINGS) {
      const pts = ring.map(([x, y]) => [X(x), Y(y)]);
      d += `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")} Z`;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);
  const poly = (pts: [number, number][]) => pts.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join(" ");
  const grid: number[] = [];
  for (let lo = Math.ceil(R.minLon / R.step) * R.step; lo <= R.maxLon; lo += R.step) grid.push(lo);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <button key={r.id} onClick={() => setRegion(r.id)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${region === r.id ? "bg-slate-900 text-white" : "border bg-white text-slate-600"}`}>
            {r.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-2xl bg-[#0E1E33] ring-1 ring-amber-200 dark:ring-red-950" role="img" aria-label="Maritime security areas map">
        <rect x="0" y="0" width={W} height={H} fill="#0E1E33" />
        {grid.map((lo) => (
          <g key={lo}>
            <line x1={X(lo)} y1="0" x2={X(lo)} y2={H} stroke="#ffffff" strokeOpacity="0.12" />
            <text x={X(lo) + 2} y={H - 4} fontSize="9" fill="#9fb3c8">{Math.abs(lo)}°{lo === 0 ? "" : lo > 0 ? "E" : "W"}</text>
          </g>
        ))}
        {Array.from({ length: Math.floor((R.maxLat - R.minLat) / R.step) + 1 }, (_, i) => R.minLat + Math.ceil((R.minLat % R.step + R.step) % R.step) + i * R.step).filter((la) => la <= R.maxLat).map((la) => (
          <g key={la}>
            <line x1="0" y1={Y(la)} x2={W} y2={Y(la)} stroke="#ffffff" strokeOpacity="0.12" />
            <text x="3" y={Y(la) - 3} fontSize="9" fill="#9fb3c8">{Math.abs(la)}°{la === 0 ? "" : la > 0 ? "N" : "S"}</text>
          </g>
        ))}
        {region === "world" && HRA_ZONES.map((z) => (
          <ellipse key={z.n} cx={X(z.lon)} cy={Y(z.lat)} rx={(z.rx / 360) * W} ry={(z.ry / 180) * H} fill={LEVEL_FILL[z.level]} opacity="0.45" />
        ))}
        <path d={land} fill="#1d3a52" />
        {region === "redsea" && (
          <g>
            <polygon points={poly(REDSEA_HRA)} fill="#dc2626" opacity="0.35" stroke="#dc2626" strokeWidth="2" />
            <polyline points={poly(YEMEN_LEG)} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 4" />
            <rect x={X(44)} y={Y(13.6)} width={X(53.5) - X(44)} height={Y(11.4) - Y(13.6)} fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={X(48.7)} y={Y(13.9)} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fbbf24">IRTC / MSTC (schematic)</text>
            <circle cx={X(42.9)} cy={Y(16.4)} r="4" fill="#fff" />
            <text x={X(42.9)} y={Y(16.4) - 8} textAnchor="end" fontSize="10" fontWeight="800" fill="#fff">16°24.12′N SA–YE border (IBF Dec 2023)</text>
            <circle cx={X(43.5)} cy={Y(12.55)} r="4" fill="#fff" />
            <text x={X(43.5)} y={Y(12.55) + 16} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">Bab el-Mandeb TSS</text>
            <circle cx={X(45.02)} cy={Y(12.78)} r="3.5" fill="#fbbf24" />
            <text x={X(45.02)} y={Y(12.78) - 7} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fbbf24">Aden 45°01.4′E</text>
            <circle cx={X(45.02)} cy={Y(12.08)} r="3.5" fill="#fbbf24" />
            <text x={X(45.02)} y={Y(12.08) + 15} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fbbf24">12°05′N IRTC</text>
            <text x={X(36)} y={Y(20)} fontSize="11" fontWeight="900" fill="#fca5a5">Southern Red Sea HRA — excl. 12 nm off Yemen (war zone)</text>
          </g>
        )}
        {region === "hormuz" && (
          <g>
            <ellipse cx={X(57.2)} cy={Y(25.3)} rx={(3.2 / (R.maxLon - R.minLon)) * W} ry={(1.8 / (R.maxLat - R.minLat)) * H} fill="#dc2626" opacity="0.3" stroke="#dc2626" strokeWidth="2" strokeDasharray="7 4" />
            <line x1={X(55.2)} y1={Y(26.0)} x2={X(57.8)} y2={Y(24.6)} stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#arr)" />
            <line x1={X(57.8)} y1={Y(25.1)} x2={X(55.2)} y2={Y(26.4)} stroke="#7dd3fc" strokeWidth="2.5" markerEnd="url(#arr)" />
            <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#fff" strokeWidth="1.2" /></marker></defs>
            <text x={X(56.45)} y={Y(26.35)} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">Strait of Hormuz TSS (schematic lanes)</text>
            <text x={X(56.5)} y={Y(26.75)} textAnchor="middle" fontSize="10" fontWeight="800" fill="#9fb3c8">Musandam (OM)</text>
            <text x={X(54.4)} y={Y(24.3)} textAnchor="middle" fontSize="11" fontWeight="900" fill="#fca5a5">← Persian Gulf (WOA)</text>
            <text x={X(59.3)} y={Y(24.3)} textAnchor="middle" fontSize="11" fontWeight="900" fill="#fca5a5">Gulf of Oman (WOA) →</text>
            <text x={X(57)} y={Y(23.2)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fbbf24">WOA: Hormuz + GoO + Persian Gulf (Mar 2026, weekly review)</text>
          </g>
        )}
        {region === "blacksea" && (
          <g>
            <ellipse cx={X(34)} cy={Y(43.5)} rx={(7 / (R.maxLon - R.minLon)) * W} ry={(2.5 / (R.maxLat - R.minLat)) * H} fill="#dc2626" opacity="0.35" stroke="#dc2626" strokeWidth="2" />
            <text x={X(34)} y={Y(45.2)} textAnchor="middle" fontSize="11" fontWeight="900" fill="#fca5a5">Black Sea WOA — limits per current IBF list</text>
          </g>
        )}
        {region === "guinea" && (
          <g>
            <ellipse cx={X(2)} cy={Y(1)} rx={(9 / (R.maxLon - R.minLon)) * W} ry={(5 / (R.maxLat - R.minLat)) * H} fill="#d97706" opacity="0.35" stroke="#d97706" strokeWidth="2" />
            <text x={X(2)} y={Y(4.6)} textAnchor="middle" fontSize="11" fontWeight="900" fill="#fcd34d">Gulf of Guinea — legs per IBF papers (verify current list)</text>
          </g>
        )}
        {region === "world" && HRA_ZONES.map((z) => (
          <g key={z.n}>
            <circle cx={X(z.lon)} cy={Y(z.lat)} r="9" fill={LEVEL_FILL[z.level]} stroke="#fff" strokeWidth="1.5" />
            <text x={X(z.lon)} y={Y(z.lat) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{z.n}</text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-800">🔴 WOA — Warlike Operations Area</span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">🟠 HRA — High Risk Area</span>
        <span className="rounded-full bg-teal-100 px-2.5 py-1 text-teal-800">🟢 VRA — Voluntary Reporting Area</span>
      </div>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {HRA_ZONES.map((z) => (
          <li key={z.n} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: LEVEL_FILL[z.level] }}>{z.n}</span>
            <span><strong>{z.name}</strong> <span className="text-xs font-bold opacity-70">[{z.level}]</span><br /><span className="opacity-80">{z.note}</span></span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] opacity-60">Detail views draw IBF-published reference points (Red Sea Dec 2023; Hormuz Mar 2026); other joins are schematic. Designations change often — exact limits are in UKHO chart Q6099, BMP Maritime Security and the current IBF/ITF list annexed to your CBA.</p>
    </div>
  );
}
