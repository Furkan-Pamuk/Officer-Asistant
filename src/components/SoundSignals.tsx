"use client";

import { MANEUVER_SIGNALS, FOG_PATTERNS, DISTRESS_SIGNALS, type BlastKind } from "@/lib/colreg";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";

function Blast({ k, x }: { k: BlastKind; x: number }) {
  if (k === "P") return (<g><rect x={x} y="14" width="14" height="18" rx="2" fill="#0f172a" /><text x={x + 7} y="27" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">—</text></g>);
  if (k === "S") return (<g><rect x={x} y="14" width="5" height="18" rx="2" fill="#0f172a" /><text x={x + 2.5} y="27" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff">·</text></g>);
  if (k === "bell") return (<g><rect x={x} y="14" width="18" height="18" rx="2" fill="#15803d" /><text x={x + 9} y="27" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff">bell</text></g>);
  if (k === "gong") return (<g><rect x={x} y="14" width="18" height="18" rx="2" fill="#1d4ed8" /><text x={x + 9} y={27} textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff">gong</text></g>);
  if (k === "R") return (<g><rect x={x} y="14" width="5" height="18" rx="2" fill="#0f172a" /><rect x={x + 8} y="14" width="14" height="18" rx="2" fill="#0f172a" /><rect x={x + 25} y="14" width="5" height="18" rx="2" fill="#0f172a" /><text x={x + 17} y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">R ·—·</text></g>);
  return (<g><rect x={x} y="14" width="12" height="18" rx="2" fill="#64748b" /><text x={x + 6} y="44" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">sound</text></g>);
}

const W: Record<BlastKind, number> = { P: 14, S: 5, bell: 18, gong: 18, R: 30, X: 12 };

function computeBlastPositions(seq: BlastKind[]): number[] {
  let curX = 8;
  return seq.map((k) => {
    const pos = curX;
    curX += W[k] + 5;
    return pos;
  });
}

function FogRow({ v, seq, note }: { v: string; seq: BlastKind[]; note: string }) {
  const positions = computeBlastPositions(seq);
  return (
    <div className="rounded-2xl border bg-white p-3">
      <h3 className="text-sm font-bold">{v}</h3>
      <svg viewBox="0 0 300 50" className="mt-1 h-auto w-full" role="img" aria-label={`Fog signal: ${v}`}>
        <line x1="4" y1="40" x2="240" y2="40" stroke="#cbd5e1" strokeWidth="1" />
        <text x="4" y="48" fontSize="7" fill="#94a3b8">0</text>
        <text x="236" y="48" fontSize="7" fill="#94a3b8">≤2 min ⟳</text>
        {seq.map((k, i) => (
          <Blast key={i} k={k} x={positions[i]} />
        ))}
      </svg>
      {note ? <p className="text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}

export default function SoundSignals() {
  const o = useContentOverlay();
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-black">📯 Manoeuvring &amp; warning signals (in sight of one another)</h2>
        <ul className="mt-2 grid gap-1.5">
          {MANEUVER_SIGNALS.map((m0) => {
            const m = withOv(m0, cov(o, "maneuver", m0.s));
            return (
            <li key={m0.s} className="flex items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black">
              <span className="min-w-20 shrink-0 rounded-lg bg-slate-900 px-2 py-1 text-center font-black tracking-widest text-white">{m.s}</span>
              <span>{m.m}</span>
            </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">· short ≈1 s · — prolonged 4–6 s. The doubt signal may add ≥5 rapid flashes by light (Rule 34/36).</p>
      </div>
      <h2 className="font-black">🌫️ Fog signals — one pattern per ≤2 minutes (Rule 35)</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {FOG_PATTERNS.map((f0) => {
          const f = withOv(f0, cov(o, "fog", f0.v));
          return <FogRow key={f0.v} v={f.v} seq={f.seq} note={f.note} />;
        })}
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-black">🆘 Distress signals (Annex IV) — recognise &amp; respond</h2>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {DISTRESS_SIGNALS.map((d, i) => {
            const v = (cov(o, "distress", i).value as string | undefined) ?? d;
            return (
            <li key={d} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">• {v}</li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Acknowledge, relay to RCC/coast station, log everything, proceed to assist as able — the duty to assist is a legal obligation (Rule 37).</p>
      </div>
    </div>
  );
}
