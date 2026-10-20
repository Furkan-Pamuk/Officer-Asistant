"use client";

// Offline schematic diagrams for Lights & Buoys (IALA). Pure SVG — no external images.

type Shape = "can" | "cone" | "pillar" | "sphere";
type Top = "none" | "can" | "cone" | "cones-N" | "cones-E" | "cones-S" | "cones-W" | "spheres-2" | "sphere-1" | "X" | "cross";

function Topmark({ kind, cx = 50 }: { kind: Top; cx?: number }) {
  const up = (y: number) => `${cx},${y} ${cx + 10},${y + 18} ${cx - 10},${y + 18}`;
  const dn = (y: number) => `${cx},${y + 18} ${cx + 10},${y} ${cx - 10},${y}`;
  switch (kind) {
    case "can": return <rect x={cx - 9} y={8} width={18} height={20} fill="#111" />;
    case "cone": return <polygon points={up(8)} fill="#111" />;
    case "cones-N": return (<g fill="#111"><polygon points={up(4)} /><polygon points={up(22)} /></g>);
    case "cones-S": return (<g fill="#111"><polygon points={dn(4)} /><polygon points={dn(22)} /></g>);
    case "cones-E": return (<g fill="#111"><polygon points={dn(4)} /><polygon points={up(22)} /></g>);
    case "cones-W": return (<g fill="#111"><polygon points={up(4)} /><polygon points={dn(22)} /></g>);
    case "spheres-2": return (<g fill="#111"><circle cx={cx} cy={14} r={8} /><circle cx={cx} cy={32} r={8} /></g>);
    case "sphere-1": return <circle cx={cx} cy={22} r={10} fill="#c22" />;
    case "X": return (<g stroke="#111" strokeWidth={5} strokeLinecap="round"><line x1={cx - 9} y1={8} x2={cx + 9} y2={32} /><line x1={cx + 9} y1={8} x2={cx - 9} y2={32} /></g>);
    case "cross": return (<g fill="#ffcf3d" stroke="#111" strokeWidth={2}><rect x={cx - 4} y={4} width={8} height={32} /><rect x={cx - 14} y={14} width={28} height={8} /></g>);
    default: return null;
  }
}

function Body({ shape, bands }: { shape: Shape; bands: string[] }) {
  const n = bands.length;
  const seg = (i: number) => bands[Math.min(i, n - 1)];
  if (shape === "sphere") return <circle cx={50} cy={105} r={38} fill={bands[0]} stroke="#111" strokeWidth={2} />;
  if (shape === "cone") {
    return (
      <g stroke="#111" strokeWidth={2}>
        <polygon points="28,142 72,142 58,52 42,52" fill={seg(0)} />
        <polygon points="37.5,97 62.5,97 58,52 42,52" fill={seg(1)} />
        <polygon points="42,52 58,52 54.5,52 45.5,52" fill={seg(2)} />
      </g>
    );
  }
  // can + pillar
  const w = shape === "pillar" ? 34 : 44;
  const x = 50 - w / 2;
  const top = 52, h = 90, rows = shape === "pillar" ? 5 : n;
  const parts = [];
  for (let i = 0; i < rows; i++) {
    const y = top + (h / rows) * i;
    parts.push(<rect key={i} x={x} y={y} width={w} height={h / rows + 0.5} fill={bands[Math.floor((i * n) / rows)]} />);
  }
  return (
    <g stroke="#111" strokeWidth={2}>
      {shape === "pillar" && <rect x={28} y={44} width={44} height={9} fill="#333" />}
      {parts}
      <rect x={x} y={top} width={w} height={h} fill="none" />
    </g>
  );
}

export function BuoyFigure({ shape, bands, top, glow, label, sub }: {
  shape: Shape; bands: string[]; top: Top; glow?: string; label: string; sub?: string;
}) {
  return (
    <figure className="flex w-28 shrink-0 flex-col items-center text-center">
      <svg viewBox="0 0 100 168" className="h-36 w-24" role="img" aria-label={label}>
        <Topmark kind={top} />
        <rect x={47} y={40} width={6} height={8} fill="#111" />
        {glow && <circle cx={50} cy={38} r={6} fill={glow} stroke="#111" strokeWidth={1.5} />}
        <Body shape={shape} bands={bands} />
        <path d="M6,150 q8,-6 16,0 t16,0 t16,0 t16,0 t16,0" fill="none" stroke="#2AA198" strokeWidth={3} strokeLinecap="round" />
        <path d="M14,159 q8,-6 16,0 t16,0 t16,0 t16,0" fill="none" stroke="#2AA198" strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      </svg>
      <figcaption className="mt-1 text-xs font-black">{label}</figcaption>
      {sub && <span className="text-[11px] opacity-70">{sub}</span>}
    </figure>
  );
}

export function LateralRow() {
  return (
    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
      <div className="text-xs font-black uppercase tracking-widest opacity-60">Region A — entering from sea (B: red/green swapped)</div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <BuoyFigure shape="can" bands={["#d43d3d"]} top="can" glow="#ff5b5b" label="PORT" sub="Red • can • Fl.R" />
        <BuoyFigure shape="cone" bands={["#1f9d55"]} top="cone" glow="#37d67a" label="STBD" sub="Green • cone • Fl.G" />
        <BuoyFigure shape="pillar" bands={["#d43d3d", "#1f9d55"]} top="can" glow="#ffcf3d" label="PREF. PORT" sub="Red+green band" />
        <BuoyFigure shape="pillar" bands={["#1f9d55", "#d43d3d"]} top="cone" glow="#ffcf3d" label="PREF. STBD" sub="Green+red band" />
      </div>
    </div>
  );
}

export function CardinalGrid() {
  return (
    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
      <div className="text-xs font-black uppercase tracking-widest opacity-60">Cardinal marks — pass to the named side</div>
      <div className="mt-2 grid grid-cols-2 justify-items-center gap-2 sm:grid-cols-4">
        <BuoyFigure shape="pillar" bands={["#111", "#f5c518", "#f5c518", "#f5c518", "#f5c518"]} top="cones-N" glow="#fff" label="NORTH" sub="Unbroken Q/VQ" />
        <BuoyFigure shape="pillar" bands={["#111", "#f5c518", "#111", "#f5c518", "#111"]} top="cones-E" glow="#fff" label="EAST" sub="3 flashes" />
        <BuoyFigure shape="pillar" bands={["#f5c518", "#f5c518", "#111", "#111", "#111"]} top="cones-S" glow="#fff" label="SOUTH" sub="6 + 1 long" />
        <BuoyFigure shape="pillar" bands={["#f5c518", "#111", "#111", "#111", "#f5c518"]} top="cones-W" glow="#fff" label="WEST" sub="9 flashes" />
      </div>
    </div>
  );
}

export function OtherMarksRow() {
  return (
    <div className="mt-3 rounded-xl bg-white p-3 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
      <div className="text-xs font-black uppercase tracking-widest opacity-60">Other marks</div>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <BuoyFigure shape="pillar" bands={["#111", "#d43d3d", "#111"]} top="spheres-2" glow="#fff" label="ISOL. DANGER" sub="Fl(2) W" />
        <BuoyFigure shape="sphere" bands={["#d43d3d"]} top="sphere-1" glow="#fff" label="SAFE WATER" sub="Red/white stripes" />
        <BuoyFigure shape="can" bands={["#f5c518"]} top="X" glow="#ffcf3d" label="SPECIAL" sub="Yellow • X" />
        <BuoyFigure shape="pillar" bands={["#2456d6", "#f5c518"]} top="cross" glow="#7fd1ff" label="WRECK BUOY" sub="Blue/yellow" />
      </div>
    </div>
  );
}

export function RhythmStrip({ title, period, lit, color = "#fff" }: {
  title: string; period: number; lit: [number, number][]; color?: string;
}) {
  const W = 300, H = 30;
  const x = (t: number) => (t / period) * W;
  return (
    <div className="rounded-xl bg-stone-900 px-3 py-2 text-amber-50 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-white print:text-black print:ring-1 print:ring-black">
      <div className="flex justify-between text-[11px] font-black"><span>{title}</span><span>{period}s</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full" role="img" aria-label={title}>
        <rect x={0} y={8} width={W} height={14} rx={7} fill="rgba(255,255,255,0.12)" className="print:fill-none print:stroke-black" />
        {lit.map(([a, b], i) => (
          <rect key={i} x={x(a)} y={8} width={Math.max(2, x(b) - x(a))} height={14} rx={i === 0 ? 0 : 3} fill={color} stroke="#111" strokeWidth={0.5} />
        ))}
        {Array.from({ length: period + 1 }, (_, s) => (
          <g key={s}>
            <line x1={x(s)} y1={22} x2={x(s)} y2={27} stroke="currentColor" strokeWidth={1} opacity={0.6} />
            {s % 5 === 0 && <text x={x(s) + 2} y={27} fontSize={7} fill="currentColor" opacity={0.7}>{s}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function RhythmList() {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <RhythmStrip title="Fl(2) — isolated danger" period={10} lit={[[0, 1], [2.5, 3.5]]} />
      <RhythmStrip title="Q(3) 10s — EAST cardinal" period={10} lit={[[0, 0.7], [1.5, 2.2], [3, 3.7]]} />
      <RhythmStrip title="VQ(6)+LFl 15s — SOUTH" period={15} lit={[[0, 0.5], [1, 1.5], [2, 2.5], [3, 3.5], [4, 4.5], [5, 5.5], [8, 10.5]]} />
      <RhythmStrip title="VQ(9) 15s — WEST" period={15} lit={[[0, 0.5], [1.2, 1.7], [2.4, 2.9], [3.6, 4.1], [4.8, 5.3], [6, 6.5], [7.2, 7.7], [8.4, 8.9], [9.6, 10.1]]} />
      <RhythmStrip title="Iso 8s — safe water" period={8} lit={[[0, 4]]} />
      <RhythmStrip title="Oc 6s" period={6} lit={[[0, 4.5]]} />
      <RhythmStrip title="Mo(A) — dot + dash" period={8} lit={[[0, 0.8], [2, 5]]} />
      <RhythmStrip title="Fl(2+1) — preferred channel" period={12} lit={[[0, 1], [2.5, 3.5], [6.5, 7.5]]} />
    </div>
  );
}
