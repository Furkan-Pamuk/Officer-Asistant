"use client";

import { useMemo } from "react";
import { SAR_CENTRES } from "@/lib/sar-data";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import { LAND_RINGS } from "@/lib/world-land";

const W = 720;
const H = 360;

export default function SarMap() {
  const o = useContentOverlay();
  const centres = SAR_CENTRES.map((c) => withOv(c, cov(o, "sar", c.n)));
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
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-2xl bg-[#0E1E33] ring-1 ring-amber-200 dark:ring-red-950" role="img" aria-label="SAR centres world map">
        <rect x="0" y="0" width={W} height={H} fill="#0E1E33" />
        <path d={land} fill="#1d3a52" />
        {centres.map((c) => (
          <g key={c.n}>
            <circle cx={X(c.lon)} cy={Y(c.lat)} r="9" fill="#ea580c" stroke="#fff" strokeWidth="1.5" />
            <text x={X(c.lon)} y={Y(c.lat) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">{c.n}</text>
          </g>
        ))}
      </svg>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {centres.map((c) => (
          <li key={c.n} className="rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-black text-white">{c.n}</span>
              <strong>{c.name}</strong>
            </div>
            <p className="mt-0.5 opacity-80">{c.authority} · {c.coverage}</p>
            <p className="mt-0.5 font-bold">
              {c.phone ? <a className="underline" href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a> : <span className="opacity-60">phone: see ALRS Vol 5</span>}
              {c.email ? <> · <a className="underline" href={`mailto:${c.email}`}>{c.email}</a></> : null}
            </p>
          </li>
        ))}
      </ol>
      <p className="text-[11px] opacity-60">Contacts verified Oct 2026 — confirm before use (ALRS Vol 5 / GISIS). Distress first: VHF Ch 16 / DSC Ch 70, MF/HF, Inmarsat-C. Centres shown are coordination points; the nearest coast station always answers first.</p>
    </div>
  );
}
