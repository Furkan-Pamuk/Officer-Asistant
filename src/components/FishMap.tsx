"use client";

// World fishing grounds — schematic overview with signature species.
// General knowledge (FAO-area level); seasons and quotas vary locally.
export interface FishZone {
  n: number;
  name: string;
  lon: number;
  lat: number;
  rx: number;
  ry: number;
  species: string;
}

export const FISH_ZONES: FishZone[] = [
  { n: 1, name: "North Sea", lon: 3, lat: 57, rx: 9, ry: 5, species: "Atlantic cod, haddock, herring, mackerel" },
  { n: 2, name: "Norwegian & Barents Sea", lon: 15, lat: 70, rx: 14, ry: 6, species: "Northeast Arctic cod (skrei), capelin, haddock" },
  { n: 3, name: "Grand Banks", lon: -50, lat: 47, rx: 10, ry: 6, species: "Cod, haddock, redfish, capelin" },
  { n: 4, name: "Bering Sea & Gulf of Alaska", lon: -170, lat: 58, rx: 15, ry: 7, species: "Walleye pollock, Pacific salmon, halibut, king crab" },
  { n: 5, name: "Sea of Japan & East China Sea", lon: 128, lat: 33, rx: 11, ry: 8, species: "Japanese flying squid, chub mackerel, sardine" },
  { n: 6, name: "South China Sea", lon: 114, lat: 12, rx: 9, ry: 7, species: "Tunas, grouper, snapper" },
  { n: 7, name: "Bay of Bengal", lon: 88, lat: 12, rx: 8, ry: 8, species: "Hilsa shad, shrimp, Indian mackerel" },
  { n: 8, name: "Arabian Sea", lon: 63, lat: 15, rx: 10, ry: 7, species: "Yellowfin tuna, kingfish (seerfish)" },
  { n: 9, name: "Humboldt Current", lon: -80, lat: -10, rx: 7, ry: 12, species: "Anchoveta, jack mackerel" },
  { n: 10, name: "Patagonian Shelf", lon: -62, lat: -45, rx: 8, ry: 10, species: "Argentine hake, shortfin squid (Illex)" },
  { n: 11, name: "Benguela Current", lon: 12, lat: -25, rx: 7, ry: 10, species: "Hake, sardine (pilchard)" },
  { n: 12, name: "Mediterranean", lon: 15, lat: 37, rx: 12, ry: 5, species: "Bluefin tuna, anchovy, sardine" },
  { n: 13, name: "Tropical Indian Ocean", lon: 75, lat: -8, rx: 15, ry: 8, species: "Yellowfin & bigeye tuna, skipjack" },
  { n: 14, name: "Coral Sea & Pacific Islands", lon: 155, lat: -15, rx: 15, ry: 10, species: "Coral trout, tunas, mahi-mahi" },
];

import { useMemo } from "react";
import { LAND_RINGS } from "@/lib/world-land";
import { useLocale } from "@/lib/i18n";

const W = 720;
const H = 360;

export default function FishMap() {
  const { t } = useLocale();
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
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-2xl bg-[#0E1E33] ring-1 ring-amber-200 dark:ring-red-950" role="img" aria-label={t("fish.aria")}>
        <rect x="0" y="0" width={W} height={H} fill="#0E1E33" />
        {FISH_ZONES.map((z) => (
          <ellipse key={z.n} cx={X(z.lon)} cy={Y(z.lat)} rx={(z.rx / 360) * W} ry={(z.ry / 180) * H} fill="#2AA198" opacity="0.45" />
        ))}
        <path d={land} fill="#1d3a52" />
        {FISH_ZONES.map((z) => (
          <g key={z.n}>
            <circle cx={X(z.lon)} cy={Y(z.lat)} r="9" fill="#b45309" stroke="#fff" strokeWidth="1.5" />
            <text x={X(z.lon)} y={Y(z.lat) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{z.n}</text>
          </g>
        ))}
      </svg>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {FISH_ZONES.map((z) => (
          <li key={z.n} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b45309] text-xs font-black text-white">{z.n}</span>
            <span><strong>{z.name}</strong><br /><span className="opacity-80">{z.species}</span></span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] opacity-60">{t("fish.note")}</p>
    </div>
  );
}
