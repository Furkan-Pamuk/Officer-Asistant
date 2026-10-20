"use client";

import { BEAUFORT, CLOUDS } from "@/lib/navigation-documents";

// Stylised cloud sketches (offline SVG). Educational, not to scale.

export function CloudFigure({ id }: { id: string }) {
  const sky = "#bcd7e6";
  const dark = "#5B7186";
  const white = "#ffffff";
  const shade = "#dfe9ef";
  const common = "h-16 w-28";
  switch (id) {
    case "ci":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={sky} rx={8} /><g stroke={white} strokeWidth={3} fill="none" strokeLinecap="round"><path d="M10,22 C30,14 50,26 70,18" /><path d="M25,34 C45,28 60,38 85,30" /><path d="M50,44 C65,40 80,46 95,42" /></g></svg>);
    case "cc":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={sky} rx={8} /><g fill={white}>{[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => <ellipse key={`${r}${c}`} cx={16 + c * 22} cy={14 + r * 12} rx={9} ry={4.5} />))}</g></svg>);
    case "cs":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={shade} rx={8} /><circle cx={60} cy={30} r={10} fill="none" stroke={white} strokeWidth={3} opacity={0.9} /><circle cx={60} cy={30} r={16} fill="none" stroke={white} strokeWidth={1.5} opacity={0.5} /></svg>);
    case "ac":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={sky} rx={8} /><g fill={white}><ellipse cx={30} cy={30} rx={20} ry={10} /><ellipse cx={60} cy={24} rx={22} ry={12} /><ellipse cx={90} cy={32} rx={18} ry={9} /></g><g fill={shade}><ellipse cx={34} cy={34} rx={14} ry={6} /><ellipse cx={88} cy={36} rx={12} ry={5} /></g></svg>);
    case "as":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill="#9fb3c0" rx={8} /><rect y={18} width={120} height={26} fill="#8a9fae" opacity={0.7} rx={4} /><circle cx={60} cy={30} r={8} fill={white} opacity={0.35} /></svg>);
    case "ns":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={dark} rx={8} /><g stroke="#7cc4e8" strokeWidth={2.5} strokeLinecap="round"><line x1={25} y1={36} x2={22} y2={48} /><line x1={45} y1={36} x2={42} y2={48} /><line x1={65} y1={36} x2={62} y2={48} /><line x1={85} y1={36} x2={82} y2={48} /></g></svg>);
    case "cu":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={sky} rx={8} /><g fill={white}><ellipse cx={42} cy={40} rx={20} ry={12} /><ellipse cx={62} cy={34} rx={16} ry={14} /><ellipse cx={78} cy={42} rx={14} ry={9} /></g><line x1={10} y1={48} x2={110} y2={48} stroke={dark} strokeWidth={2} strokeDasharray="6 4" /></svg>);
    case "cb":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill="#8a9fae" rx={8} /><g fill={white}><rect x={44} y={8} width={34} height={10} rx={5} /><ellipse cx={52} cy={40} rx={22} ry={14} /><ellipse cx={72} cy={42} rx={14} ry={10} /></g><polygon points="50,44 44,54 48,54 42,60 54,50 50,50" fill="#f5c518" /></svg>);
    case "sc":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill={sky} rx={8} /><g fill={white}><ellipse cx={22} cy={26} rx={18} ry={10} /><ellipse cx={52} cy={22} rx={22} ry={12} /><ellipse cx={88} cy={28} rx={20} ry={10} /></g><g fill={shade}><ellipse cx={26} cy={32} rx={14} ry={7} /><ellipse cx={90} cy={34} rx={14} ry={6} /></g></svg>);
    case "st":
      return (<svg viewBox="0 0 120 60" className={common}><rect width={120} height={60} fill="#9fb3c0" rx={8} /><rect y={10} width={120} height={40} fill="#8a9fae" rx={4} /><rect y={44} width={120} height={6} fill={dark} opacity={0.5} /></svg>);
    default:
      return null;
  }
}

export function CloudGallery() {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {CLOUDS.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
          <CloudFigure id={c.id} />
          <div className="text-xs leading-snug">
            <div className="text-sm font-black">{c.name}</div>
            <div className="font-bold text-[#0E6E64] dark:text-red-300">{c.level}</div>
            <div className="opacity-80">{c.looks}</div>
            <div className="mt-0.5 font-medium">➜ {c.means}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FrontSymbols() {
  return (
    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
      <div className="text-xs font-black uppercase tracking-widest opacity-60">Front symbols on synoptic charts</div>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-center">
        {[
          { n: "COLD front", d: "M4,20 L76,20 M14,20 l6,-10 6,10 M38,20 l6,-10 6,10 M62,20 l6,-10 6,10", c: "#2456d6" },
          { n: "WARM front", d: "M4,20 L76,20", c: "#d43d3d", sc: true },
          { n: "OCCLUDED", d: "M4,20 L76,20 M14,20 l6,-10 6,10 M38,20 l6,-10 6,10 M62,20 l6,-10 6,10", c: "#7c3aed", sc: true },
        ].map((f) => (
          <figure key={f.n} className="w-36">
            <svg viewBox="0 0 80 40" className="h-10 w-full">
              <path d={f.d} fill={f.sc ? f.c : "none"} fillOpacity={f.sc ? 0.35 : 1} stroke={f.c} strokeWidth={3} strokeLinejoin="round" />
              {f.sc && <g fill={f.c}><circle cx={26} cy={20} r={6} /><circle cx={52} cy={20} r={6} /></g>}
            </svg>
            <figcaption className="text-[11px] font-black">{f.n}</figcaption>
          </figure>
        ))}
        <figure className="w-36">
          <svg viewBox="0 0 80 40" className="h-10 w-full">
            <text x={14} y={28} fontSize={20} fontWeight="black" fill="#d43d3d">L</text>
            <text x={52} y={28} fontSize={20} fontWeight="black" fill="#2456d6">H</text>
          </svg>
          <figcaption className="text-[11px] font-black">LOW (rain) / HIGH (settled)</figcaption>
        </figure>
      </div>
    </div>
  );
}

export function BeaufortTable() {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl bg-white ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
      <table className="w-full min-w-[560px] text-xs">
        <thead>
          <tr className="bg-amber-100 text-left dark:bg-red-950">
            <th className="px-2 py-1.5">F</th>
            <th className="px-2 py-1.5">Name</th>
            <th className="px-2 py-1.5">kn</th>
            <th className="px-2 py-1.5">Sea</th>
            <th className="px-2 py-1.5">Shipboard action</th>
          </tr>
        </thead>
        <tbody>
          {BEAUFORT.map((b) => (
            <tr key={b.f} className={`border-t border-amber-200 dark:border-red-950 ${b.f >= 8 ? "bg-red-50 font-bold dark:bg-red-950/40" : ""}`}>
              <td className="px-2 py-1 font-black">{b.f}</td>
              <td className="px-2 py-1 font-bold">{b.name}</td>
              <td className="px-2 py-1">{b.kn}</td>
              <td className="px-2 py-1">{b.sea}</td>
              <td className="px-2 py-1">{b.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TwelfthsStrip() {
  const parts = [1, 2, 3, 3, 2, 1];
  const total = 12;
  const labels = ["HW", "+1", "+2", "+3", "+4", "+5", "LW"];
  return (
    <div className="mt-3 rounded-xl bg-stone-900 p-3 text-amber-50 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-white print:text-black print:ring-1 print:ring-black">
      <div className="text-xs font-black uppercase tracking-widest opacity-70">Rule of twelfths — rise/fall per hour</div>
      <div className="mt-2 flex h-10 overflow-hidden rounded-lg">
        {parts.map((p, i) => (
          <div key={i} style={{ width: `${(p / total) * 100}%` }} className="flex items-center justify-center bg-[#2AA198] text-xs font-black text-[#081120] dark:bg-red-700 dark:text-white print:bg-stone-200" title={`Hour ${i + 1}: ${p}/12`}>
            {p}/12
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-bold opacity-70">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}
