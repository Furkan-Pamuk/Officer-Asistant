"use client";

import { useMemo } from "react";
import { LAND_RINGS } from "@/lib/world-land";

// Maritime security areas — SCHEMATIC shapes, not boundaries.
// Levels follow the IBF/ITF designations reported around Oct 2026 and change
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
  { n: 3, name: "Strait of Hormuz & approaches", level: "WOA", lon: 57, lat: 25.5, rx: 5, ry: 4, note: "Warlike designation repeatedly extended; includes western Gulf of Oman." },
  { n: 4, name: "Western Indian Ocean (offshore)", level: "VRA", lon: 63, lat: -3, rx: 9, ry: 10, note: "Voluntary Reporting Area offshore leg — report to UKMTO." },
  { n: 5, name: "Gulf of Guinea / West Africa", level: "HRA", lon: 2, lat: 1, rx: 9, ry: 6, note: "Lagos approaches, Luanda–Baía dos Tigres, Greenville–Sassandra legs per IBF papers." },
  { n: 6, name: "Black Sea", level: "WOA", lon: 34, lat: 43.5, rx: 7, ry: 3.5, note: "Warlike area (Ukraine war); check flag/coastal-state guidance too." },
  { n: 7, name: "Israel & Lebanon coastline", level: "WOA", lon: 35.3, lat: 33.2, rx: 2.5, ry: 2.5, note: "Warlike coastal designation; port calls need company clearance." },
];

const LEVEL_FILL: Record<HraZone["level"], string> = { WOA: "#dc2626", HRA: "#d97706", VRA: "#2AA198" };

const W = 720;
const H = 360;

export default function HraMap() {
  const land = useMemo(() => {
    let d = "";
    for (const ring of LAND_RINGS) {
      const pts = ring.map(([x, y]) => [((x + 180) / 360) * W, ((90 - y) / 180) * H]);
      d += `M${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L")} Z`;
    }
    return d;
  }, []);
  const X = (lon: number) => ((lon + 180) / 360) * W;
  const Y = (lat: number) => ((90 - lat) / 180) * H;

  return (
    <div className="grid gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-2xl bg-[#0E1E33] ring-1 ring-amber-200 dark:ring-red-950" role="img" aria-label="Schematic maritime security areas map">
        <rect x="0" y="0" width={W} height={H} fill="#0E1E33" />
        {HRA_ZONES.map((z) => (
          <ellipse key={z.n} cx={X(z.lon)} cy={Y(z.lat)} rx={(z.rx / 360) * W} ry={(z.ry / 180) * H} fill={LEVEL_FILL[z.level]} opacity="0.45" />
        ))}
        <path d={land} fill="#1d3a52" />
        {HRA_ZONES.map((z) => (
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
      <p className="text-[11px] opacity-60">Schematic only — shapes are indicative, not boundaries. Designations change often (IBF list moves); exact limits are in UKHO chart Q6099, BMP Maritime Security and the current IBF/ITF list annexed to your CBA.</p>
    </div>
  );
}
