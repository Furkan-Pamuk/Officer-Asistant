// Progressive step-by-step rope figures for seamanship knots.
// Visual language: earlier steps fade to 35%, the current step draws bold
// with a dark casing; "behind/under" moves are dashed; white gaps mark
// over/under crossings; numbered dots show threading order.
// Stylised study drawings — captions carry the teaching; drill hands-on.
import type { ReactNode } from "react";

const ROPE = "#c9a227";
const NEW = "#dc2626";
const INK = "#0f172a";
const POST = "#64748b";

interface SegDef {
  d?: string;
  line?: [number, number, number, number];
  circle?: [number, number, number];
  ellipse?: [number, number, number, number];
  w?: number;
  dashed?: boolean;
  arrow?: boolean;
}
interface FrameDef {
  segs: SegDef[];
  dots?: [number, number][];
  gaps?: [number, number, number, number][];
  labels?: { x: number; y: number; t: string; red?: boolean }[];
}

function SegShape({ s, color, width, opacity, marker }: { s: SegDef; color: string; width: number; opacity: number; marker?: string }) {
  const p = { stroke: color, strokeWidth: width, fill: "none", strokeLinecap: "round" as const, opacity, strokeDasharray: s.dashed ? "10 6" : undefined, markerEnd: marker };
  if (s.d) return <path d={s.d} {...p} />;
  if (s.line) { const [x1, y1, x2, y2] = s.line; return <line x1={x1} y1={y1} x2={x2} y2={y2} {...p} />; }
  if (s.circle) { const [cx, cy, r] = s.circle; return <circle cx={cx} cy={cy} r={r} {...p} />; }
  if (s.ellipse) { const [cx, cy, rx, ry] = s.ellipse; return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...p} />; }
  return null;
}

function Frame({ id, i, caption, post, prev, cur, dots, gaps, labels }: {
  id: string; i: number; caption: string; post?: ReactNode; prev: SegDef[]; cur: FrameDef;
  dots?: [number, number][]; gaps?: [number, number, number, number][]; labels?: FrameDef["labels"];
}) {
  const m = `m-${id}-${i}`;
  return (
    <figure className="rounded-xl bg-white p-1.5 ring-1 ring-amber-200 print:ring-black">
      <svg viewBox="0 0 160 120" className="h-auto w-full" role="img" aria-label={`${id} step ${i + 1}`}>
        <defs>
          <marker id={m} markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
            <path d="M0,0 L7,4 L0,8" fill="none" stroke={NEW} strokeWidth="1.8" />
          </marker>
        </defs>
        {post}
        {prev.map((s, k) => <SegShape key={k} s={s} color={ROPE} width={s.w ?? 7} opacity={0.35} />)}
        {(gaps ?? []).map((g, k) => <line key={k} x1={g[0]} y1={g[1]} x2={g[2]} y2={g[3]} stroke="#ffffff" strokeWidth={13} strokeLinecap="round" />)}
        {cur.segs.map((s, k) => (
          <g key={k}>
            <SegShape s={s} color={INK} width={(s.w ?? 7) + 4.5} opacity={1} />
            <SegShape s={s} color={NEW} width={s.w ?? 7} opacity={1} marker={s.arrow ? `url(#${m})` : undefined} />
          </g>
        ))}
        {(dots ?? []).map(([x, y], k) => (
          <g key={k}>
            <circle cx={x} cy={y} r="8.5" fill="#ffffff" stroke={NEW} strokeWidth="2.5" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill={NEW}>{k + 1}</text>
          </g>
        ))}
        {(labels ?? []).map((l, k) => (
          <text key={k} x={l.x} y={l.y} fontSize="11" fontWeight="900" fill={l.red ? NEW : INK} stroke="#ffffff" strokeWidth="3" paintOrder="stroke">{l.t}</text>
        ))}
      </svg>
      <figcaption className="mt-1 flex gap-1.5 px-1 pb-1 text-xs leading-snug">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">{i + 1}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

const KNOT_DATA: Record<string, { post?: ReactNode; frames: FrameDef[] }> = {
  bowline: {
    frames: [
      { segs: [{ line: [110, 108, 110, 5] }, { circle: [60, 62, 17] }], labels: [{ x: 118, y: 22, t: "S" }, { x: 52, y: 66, t: "hole" }] },
      { segs: [{ d: "M60,79 C60,62 68,52 82,48", arrow: true }], dots: [[60, 82]], gaps: [[50, 79, 70, 79]], labels: [{ x: 84, y: 44, t: "A", red: true }] },
      { segs: [{ d: "M82,48 C100,48 108,54 112,62", dashed: true, arrow: true }], dots: [[98, 50]], labels: [{ x: 108, y: 50, t: "A", red: true }] },
      { segs: [{ d: "M112,62 C100,70 75,68 62,76", arrow: true }], dots: [[100, 68]], gaps: [[56, 75, 74, 70]], labels: [{ x: 52, y: 88, t: "A", red: true }] },
    ],
  },
  clove: {
    post: <rect x="68" y="8" width="14" height="88" rx="7" fill={POST} />,
    frames: [
      { segs: [{ line: [5, 55, 68, 55] }, { line: [82, 55, 145, 55] }], labels: [{ x: 130, y: 46, t: "S" }] },
      { segs: [{ line: [48, 28, 92, 72], arrow: true }], dots: [[50, 30]], gaps: [[60, 50, 80, 50]], labels: [{ x: 94, y: 68, t: "A", red: true }] },
      { segs: [{ line: [58, 28, 102, 72], arrow: true }], dots: [[60, 30]], gaps: [[67, 42, 83, 58]], labels: [{ x: 104, y: 68, t: "A", red: true }] },
      { segs: [{ d: "M102,72 C106,75 108,73 110,71" }, { d: "M112,67 C118,64 124,64 128,62", arrow: true }], dots: [[121, 63]], labels: [{ x: 130, y: 54, t: "A", red: true }] },
    ],
  },
  reef: {
    frames: [
      { segs: [{ d: "M20,55 C50,30 70,45 70,60", arrow: true }], dots: [[24, 52]], labels: [{ x: 14, y: 72, t: "A", red: true }] },
      { segs: [{ d: "M130,55 C100,80 80,65 80,50", arrow: true }], dots: [[126, 58]], gaps: [[70, 58, 88, 52]], labels: [{ x: 128, y: 72, t: "A", red: true }] },
      { segs: [{ line: [32, 46, 12, 32], w: 3, arrow: true }, { line: [32, 64, 12, 78], w: 3, arrow: true }, { line: [118, 46, 138, 32], w: 3, arrow: true }, { line: [118, 64, 138, 78], w: 3, arrow: true }] },
      { segs: [{ circle: [45, 55, 13] }, { circle: [105, 55, 13] }, { line: [55, 64, 50, 100] }, { line: [95, 64, 90, 100] }], labels: [{ x: 112, y: 100, t: "same side ✓" }] },
    ],
  },
  eight: {
    frames: [
      { segs: [{ line: [100, 108, 100, 5] }, { circle: [65, 60, 16] }], labels: [{ x: 108, y: 22, t: "S" }] },
      { segs: [{ d: "M65,76 C85,78 105,72 115,60", dashed: true, arrow: true }], dots: [[70, 78]], labels: [{ x: 116, y: 52, t: "A", red: true }] },
      { segs: [{ d: "M115,60 C110,45 90,40 72,48 C65,52 63,60 65,68", arrow: true }], dots: [[105, 50]], gaps: [[103, 57, 113, 67]], labels: [{ x: 58, y: 80, t: "A", red: true }] },
      { segs: [{ line: [65, 68, 60, 98], arrow: true }], dots: [[61, 88]], gaps: [[57, 74, 71, 70]] },
    ],
  },
  sheet: {
    frames: [
      { segs: [{ d: "M20,25 L50,25 Q75,25 75,55 Q75,85 50,85 L20,85", w: 9 }], labels: [{ x: 18, y: 100, t: "thick rope: bight" }] },
      { segs: [{ line: [95, 102, 95, 25], arrow: true }], dots: [[95, 94]], labels: [{ x: 101, y: 45, t: "A", red: true }] },
      { segs: [{ d: "M95,25 C70,20 45,30 40,55 C38,70 50,82 70,84", arrow: true }], dots: [[60, 27]], gaps: [[50, 26, 70, 26]], labels: [{ x: 34, y: 68, t: "A", red: true }] },
      { segs: [{ d: "M70,84 C85,86 95,78 97,65", arrow: true }], dots: [[85, 85]], gaps: [[83, 83, 97, 77]], labels: [{ x: 100, y: 58, t: "A", red: true }] },
    ],
  },
  rolling: {
    post: <rect x="10" y="40" width="130" height="14" rx="7" fill={POST} />,
    frames: [
      { segs: [{ ellipse: [55, 47, 10, 20] }, { ellipse: [70, 47, 10, 20] }, { line: [85, 55, 140, 66] }], labels: [{ x: 126, y: 58, t: "S" }] },
      { segs: [{ d: "M55,27 C65,20 80,25 85,40", arrow: true }], dots: [[62, 23]], gaps: [[52, 30, 64, 26]], labels: [{ x: 87, y: 32, t: "A", red: true }] },
      { segs: [{ d: "M85,40 C95,55 105,60 120,62", arrow: true }], dots: [[100, 57]], gaps: [[98, 59, 112, 61]], labels: [{ x: 122, y: 54, t: "A", red: true }] },
      { segs: [{ line: [120, 62, 144, 62], w: 3, arrow: true }], labels: [{ x: 122, y: 76, t: "PULL" }] },
    ],
  },
  roundturn: {
    post: <rect x="68" y="5" width="14" height="60" rx="7" fill={POST} />,
    frames: [
      { segs: [{ line: [5, 68, 59, 68] }, { line: [91, 68, 145, 68] }, { circle: [75, 68, 16] }], labels: [{ x: 14, y: 58, t: "S" }] },
      { segs: [{ d: "M75,84 C90,84 95,75 92,68 C90,62 80,62 78,68", arrow: true }], dots: [[84, 84]], gaps: [[72, 84, 88, 84]], labels: [{ x: 96, y: 60, t: "A", red: true }] },
      { segs: [{ d: "M92,68 C100,66 104,72 100,78 C97,82 90,80 90,75", arrow: true }], dots: [[99, 72]], gaps: [[88, 72, 98, 68]], labels: [{ x: 103, y: 84, t: "A", red: true }] },
      { segs: [{ line: [45, 68, 14, 68], w: 3, arrow: true }], labels: [{ x: 16, y: 58, t: "PULL" }] },
    ],
  },
  timber: {
    post: <rect x="8" y="42" width="134" height="20" rx="10" fill={POST} />,
    frames: [
      { segs: [{ line: [55, 30, 145, 30] }, { d: "M60,30 C50,45 50,65 65,70 L115,70", arrow: true }], dots: [[56, 46]], labels: [{ x: 132, y: 20, t: "S" }] },
      { segs: [{ d: "M115,70 C130,70 132,55 120,46 L102,33", arrow: true }], dots: [[125, 62]], gaps: [[100, 30, 116, 30]], labels: [{ x: 104, y: 44, t: "A", red: true }] },
      { segs: [{ circle: [72, 31, 5.5] }, { circle: [84, 31, 5.5] }, { circle: [96, 31, 5.5] }], dots: [[84, 16]], labels: [{ x: 100, y: 14, t: "3+ tucks", red: true }] },
      { segs: [{ line: [118, 30, 144, 30], w: 3, arrow: true }], labels: [{ x: 120, y: 20, t: "HAUL" }] },
    ],
  },
};

export function KnotStepFigures({ id, steps }: { id: string; steps: string[] }) {
  const k = KNOT_DATA[id];
  const frames: FrameDef[] = k ? k.frames : steps.map(() => ({ segs: [{ line: [10, 60, 150, 60] as [number, number, number, number] }] }));
  const prev: SegDef[][] = frames.map((_, i) => frames.slice(0, i).flatMap((f) => f.segs));
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {frames.map((f, i) => (
        <Frame key={i} id={id} i={i} caption={steps[i] ?? ""} post={k?.post} prev={prev[i]} cur={f} dots={f.dots} gaps={f.gaps} labels={f.labels} />
      ))}
    </div>
  );
}
