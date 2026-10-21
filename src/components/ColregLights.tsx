import { LIGHT_CONFIGS, type LightConfig, type ShapeKind } from "@/lib/colreg";

function Dot({ x, y, c, r = 5, label }: { x: number; y: number; c: string; r?: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 5} fill={c} opacity="0.3" />
      <circle cx={x} cy={y} r={r} fill={c} stroke="#0f172a" strokeWidth="1" />
      {label ? <text x={x + 9} y={y + 3} fontSize="8" fontWeight="700" fill="#cbd5e1">{label}</text> : null}
    </g>
  );
}

function Shape({ k, x, y }: { k: ShapeKind; x: number; y: number }) {
  const f = "#0f172a";
  if (k === "ball") return <circle cx={x} cy={y} r="7" fill={f} />;
  if (k === "cyl") return <rect x={x - 5} y={y - 8} width="10" height="16" fill={f} />;
  if (k === "diamond") return <rect x={x - 6} y={y - 6} width="12" height="12" fill={f} transform={`rotate(45 ${x} ${y})`} />;
  if (k === "coneUp") return <path d={`M${x - 7},${y + 7} L${x},${y - 7} L${x + 7},${y + 7} Z`} fill={f} />;
  return <path d={`M${x - 7},${y - 7} L${x},${y + 7} L${x + 7},${y - 7} Z`} fill={f} />;
}

function ShipSide({ c }: { c: LightConfig }) {
  return (
    <svg viewBox="0 0 300 150" className="h-auto w-full rounded-xl bg-[#0E1E33]" role="img" aria-label={c.name}>
      <rect x="0" y="0" width="300" height="150" fill="#0E1E33" />
      <line x1="0" y1="112" x2="300" y2="112" stroke="#2AA198" strokeWidth="1.5" opacity="0.6" />
      {c.shapes.length > 0 && (
        <g>
          <rect x="96" y="4" width={c.shapes.length * 22 + 12} height="26" rx="6" fill="#e2e8f0" />
          {c.shapes.map((s, i) => <Shape key={i} k={s} x={114 + i * 22} y={17} />)}
        </g>
      )}
      <rect x="25" y="96" width="250" height="16" rx="3" fill="#33506b" />
      <path d="M275,96 L294,104 L275,112 Z" fill="#33506b" />
      <rect x="150" y="64" width="36" height="32" fill="#3d5a76" />
      {c.masts.map((m, i) => (
        <g key={i}>
          <line x1={m.x} y1={Math.min(...m.ys) - 8} x2={m.x} y2="96" stroke="#94a3b8" strokeWidth="2" />
          {m.ys.map((yy, j) => <Dot key={j} x={m.x} y={yy} c="#f8fafc" label={j === 0 ? "masthead" : undefined} />)}
        </g>
      ))}
      {c.specials.map((s, i) => (
        <g key={i}>
          <line x1={s.x} y1={Math.min(...s.ys) - 8} x2={s.x} y2="96" stroke="#94a3b8" strokeWidth="2" />
          {s.ys.map((yy, j) => <Dot key={j} x={s.x} y={yy} c={s.c} />)}
          {s.label ? <text x={s.x + 10} y={s.ys[s.ys.length - 1] + 4} fontSize="8" fontWeight="700" fill="#cbd5e1">{s.label}</text> : null}
        </g>
      ))}
      {c.side && (
        <g>
          <Dot x={140} y={74} c="#ef4444" r={4} label="P" />
          <Dot x={196} y={74} c="#22c55e" r={4} label="S" />
        </g>
      )}
      {c.stern && <Dot x={30} y={88} c="#f8fafc" r={4} label="stern" />}
      {c.tow !== undefined && <Dot x={c.tow} y={74} c="#eab308" r={4} label="towing" />}
    </svg>
  );
}

export default function ColregLights() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {LIGHT_CONFIGS.map((c) => (
        <div key={c.id} className="rounded-2xl border bg-white p-3">
          <h3 className="font-bold">{c.name}</h3>
          <div className="mt-2"><ShipSide c={c} /></div>
          <p className="mt-2 text-sm text-slate-600">{c.note}</p>
        </div>
      ))}
      <p className="text-xs opacity-60 md:col-span-2">
        Side profiles, bow to the right. Sidelights show sidelight sectors (red port 112.5°, green starboard 112.5°);
        masthead 225°, stern/towing 135°, sp boom special lights all-round 360°. Ranges and exact positioning by length: Rules 22 + Annex I.
      </p>
    </div>
  );
}
