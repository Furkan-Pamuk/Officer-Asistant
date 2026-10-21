// Progressive step-by-step rope figures for seamanship knots.
// Each frame is cumulative: earlier segments in rope colour, the new segment
// of that step in red with a direction arrow. Stylised study drawings —
// captions carry the teaching; confirm with hands-on drill.
import type { ReactNode } from "react";

const ROPE = "#c9a227";
const NEW = "#dc2626";
const POST = "#64748b";

const rope = { stroke: ROPE, strokeWidth: 8, fill: "none", strokeLinecap: "round" as const };
const fresh = { stroke: NEW, strokeWidth: 8, fill: "none", strokeLinecap: "round" as const };
const ghost = { stroke: NEW, strokeWidth: 8, fill: "none", strokeLinecap: "round" as const, strokeDasharray: "10 6" };
const thin = { stroke: NEW, strokeWidth: 3, fill: "none", strokeLinecap: "round" as const };

function Frame({ id, i, caption, children }: { id: string; i: number; caption: string; children: ReactNode }) {
  const m = `m-${id}-${i}`;
  return (
    <figure className="rounded-xl bg-white p-1.5 ring-1 ring-amber-200 dark:bg-neutral-900 print:ring-black">
      <svg viewBox="0 0 150 110" className="h-auto w-full" role="img" aria-label={`${id} step ${i + 1}`}>
        <defs>
          <marker id={m} markerWidth="9" markerHeight="9" refX="6" refY="4" orient="auto">
            <path d="M0,0 L7,4 L0,8" fill="none" stroke={NEW} strokeWidth="1.6" />
          </marker>
        </defs>
        {children}
      </svg>
      <figcaption className="mt-1 flex gap-1.5 px-1 pb-1 text-xs leading-snug">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">{i + 1}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

function Steps({ id, steps, frames }: { id: string; steps: string[]; frames: ReactNode[] }) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {frames.map((f, i) => (
        <Frame key={i} id={id} i={i} caption={steps[i]}>{f}</Frame>
      ))}
    </div>
  );
}

export function KnotStepFigures({ id, steps }: { id: string; steps: string[] }) {
  switch (id) {
    case "bowline": {
      const stand = <line x1="110" y1="105" x2="110" y2="5" {...rope} />;
      const hole = <circle cx="60" cy="62" r="17" {...rope} />;
      const up = <path d="M60,79 C60,62 68,52 82,48" {...fresh} markerEnd="url(#m-bowline-1)" />;
      const round = <path d="M82,48 C100,48 108,54 112,62" {...ghost} markerEnd="url(#m-bowline-2)" />;
      const down = <path d="M112,62 C100,70 75,68 62,76" {...fresh} markerEnd="url(#m-bowline-3)" />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{stand}<circle cx="60" cy="62" r="17" {...fresh} /></g>,
          <g key="1">{stand}{hole}{up}</g>,
          <g key="2">{stand}{hole}{up}{round}</g>,
          <g key="3">{stand}{hole}<path d="M60,79 C60,62 68,52 82,48" {...rope} /><path d="M82,48 C100,48 108,54 112,62" {...rope} />{down}</g>,
        ]} />
      );
    }
    case "clove": {
      const post = <rect x="68" y="8" width="14" height="86" rx="7" fill={POST} />;
      const wrap = (<g><line x1="5" y1="55" x2="68" y2="55" {...rope} /><line x1="82" y1="55" x2="145" y2="55" {...rope} /></g>);
      const d1 = <line x1="48" y1="28" x2="92" y2="72" {...rope} />;
      const d2 = <line x1="58" y1="28" x2="102" y2="72" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{post}<line x1="5" y1="55" x2="68" y2="55" {...fresh} /><line x1="82" y1="55" x2="145" y2="55" {...fresh} /></g>,
          <g key="1">{post}{wrap}<line x1="48" y1="28" x2="92" y2="72" {...fresh} markerEnd="url(#m-clove-1)" /></g>,
          <g key="2">{post}{wrap}{d1}<line x1="58" y1="28" x2="102" y2="72" {...fresh} markerEnd="url(#m-clove-2)" /></g>,
          <g key="3">{post}{wrap}{d1}{d2}<path d="M102,72 C112,78 122,72 128,62" {...fresh} markerEnd="url(#m-clove-3)" /></g>,
        ]} />
      );
    }
    case "reef": {
      const b1 = <path d="M20,55 C50,30 70,45 70,60" {...rope} />;
      const b2 = <path d="M130,55 C100,80 80,65 80,50" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0"><path d="M20,55 C50,30 70,45 70,60" {...fresh} markerEnd="url(#m-reef-0)" /></g>,
          <g key="1">{b1}<path d="M130,55 C100,80 80,65 80,50" {...fresh} markerEnd="url(#m-reef-1)" /></g>,
          <g key="2">{b1}{b2}
            <line x1="32" y1="46" x2="12" y2="32" {...thin} markerEnd="url(#m-reef-2)" />
            <line x1="32" y1="64" x2="12" y2="78" {...thin} markerEnd="url(#m-reef-2)" />
            <line x1="118" y1="46" x2="138" y2="32" {...thin} markerEnd="url(#m-reef-2)" />
            <line x1="118" y1="64" x2="138" y2="78" {...thin} markerEnd="url(#m-reef-2)" />
          </g>,
          <g key="3">
            <circle cx="45" cy="55" r="13" {...rope} />
            <circle cx="105" cy="55" r="13" {...rope} />
            <line x1="55" y1="64" x2="50" y2="100" {...fresh} />
            <line x1="95" y1="64" x2="90" y2="100" {...fresh} />
            <circle cx="128" cy="88" r="11" fill="none" stroke="#16a34a" strokeWidth="3" />
            <path d="M122,88 L127,93 L135,81" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          </g>,
        ]} />
      );
    }
    case "eight": {
      const stand = <line x1="100" y1="105" x2="100" y2="5" {...rope} />;
      const loop = <circle cx="65" cy="60" r="16" {...rope} />;
      const behind = <path d="M65,76 C85,78 105,72 115,60" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{stand}<circle cx="65" cy="60" r="16" {...fresh} /></g>,
          <g key="1">{stand}{loop}<path d="M65,76 C85,78 105,72 115,60" {...ghost} markerEnd="url(#m-eight-1)" /></g>,
          <g key="2">{stand}{loop}<path d="M65,76 C85,78 105,72 115,60" {...rope} /><path d="M115,60 C110,45 90,40 72,48 C65,52 63,60 65,68" {...fresh} markerEnd="url(#m-eight-2)" /></g>,
          <g key="3">{stand}{loop}{behind}<path d="M115,60 C110,45 90,40 72,48 C65,52 63,60 65,68" {...rope} /><line x1="65" y1="68" x2="60" y2="96" {...fresh} markerEnd="url(#m-eight-3)" /></g>,
        ]} />
      );
    }
    case "sheet": {
      const bight = <path d="M20,25 L50,25 Q75,25 75,55 Q75,85 50,85 L20,85" {...rope} strokeWidth={9} />;
      const up = <line x1="95" y1="100" x2="95" y2="25" {...rope} />;
      const around = <path d="M95,25 C70,20 45,30 40,55 C38,70 50,82 70,84" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0"><path d="M20,25 L50,25 Q75,25 75,55 Q75,85 50,85 L20,85" {...fresh} strokeWidth={9} /></g>,
          <g key="1">{bight}<line x1="95" y1="100" x2="95" y2="25" {...fresh} markerEnd="url(#m-sheet-1)" /></g>,
          <g key="2">{bight}{up}<path d="M95,25 C70,20 45,30 40,55 C38,70 50,82 70,84" {...fresh} markerEnd="url(#m-sheet-2)" /></g>,
          <g key="3">{bight}{up}{around}<path d="M70,84 C85,86 95,78 97,65" {...fresh} markerEnd="url(#m-sheet-3)" /></g>,
        ]} />
      );
    }
    case "rolling": {
      const spar = <rect x="10" y="40" width="130" height="14" rx="7" fill={POST} />;
      const tail = <line x1="85" y1="55" x2="140" y2="66" {...rope} />;
      const t1 = <ellipse cx="55" cy="47" rx="10" ry="20" {...rope} />;
      const t2 = <ellipse cx="70" cy="47" rx="10" ry="20" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{spar}<ellipse cx="55" cy="47" rx="10" ry="20" {...fresh} /><ellipse cx="70" cy="47" rx="10" ry="20" {...fresh} />{tail}</g>,
          <g key="1">{spar}{t1}{t2}{tail}<path d="M55,27 C65,20 80,25 85,40" {...fresh} markerEnd="url(#m-rolling-1)" /></g>,
          <g key="2">{spar}{t1}{t2}<path d="M55,27 C65,20 80,25 85,40" {...rope} />{tail}<path d="M85,40 C95,55 105,60 120,62" {...fresh} markerEnd="url(#m-rolling-2)" /></g>,
          <g key="3">{spar}{t1}{t2}<path d="M55,27 C65,20 80,25 85,40" {...rope} /><path d="M85,40 C95,55 105,60 120,62" {...rope} /><line x1="120" y1="62" x2="142" y2="62" {...thin} markerEnd="url(#m-rolling-3)" /></g>,
        ]} />
      );
    }
    case "roundturn": {
      const post = <rect x="68" y="5" width="14" height="60" rx="7" fill={POST} />;
      const stand = (<g><line x1="5" y1="68" x2="59" y2="68" {...rope} /><line x1="91" y1="68" x2="145" y2="68" {...rope} /></g>);
      const turn = <circle cx="75" cy="68" r="16" {...rope} />;
      const h1 = <path d="M75,84 C90,84 95,75 92,68 C90,62 80,62 78,68" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{post}{stand}<circle cx="75" cy="68" r="16" {...fresh} /></g>,
          <g key="1">{post}{stand}{turn}<path d="M75,84 C90,84 95,75 92,68 C90,62 80,62 78,68" {...fresh} markerEnd="url(#m-roundturn-1)" /></g>,
          <g key="2">{post}{stand}{turn}{h1}<path d="M92,68 C100,66 104,72 100,78 C97,82 90,80 90,75" {...fresh} markerEnd="url(#m-roundturn-2)" /></g>,
          <g key="3">{post}<line x1="5" y1="68" x2="59" y2="68" {...rope} /><line x1="91" y1="68" x2="145" y2="68" {...rope} />{turn}{h1}<path d="M92,68 C100,66 104,72 100,78 C97,82 90,80 90,75" {...rope} /><line x1="45" y1="68" x2="14" y2="68" {...thin} markerEnd="url(#m-roundturn-3)" /></g>,
        ]} />
      );
    }
    case "timber": {
      const log = <rect x="8" y="42" width="134" height="20" rx="10" fill={POST} />;
      const stand = <line x1="55" y1="30" x2="145" y2="30" {...rope} />;
      const turn = <path d="M60,30 C50,45 50,65 65,70 L115,70" {...rope} />;
      return (
        <Steps id={id} steps={steps} frames={[
          <g key="0">{log}{stand}<path d="M60,30 C50,45 50,65 65,70 L115,70" {...fresh} markerEnd="url(#m-timber-0)" /></g>,
          <g key="1">{log}{stand}{turn}<path d="M115,70 C130,70 132,55 120,46 L102,33" {...fresh} markerEnd="url(#m-timber-1)" /></g>,
          <g key="2">{log}{stand}{turn}<path d="M115,70 C130,70 132,55 120,46 L102,33" {...rope} />
            <circle cx="72" cy="31" r="5.5" {...fresh} />
            <circle cx="84" cy="31" r="5.5" {...fresh} />
            <circle cx="96" cy="31" r="5.5" {...fresh} />
          </g>,
          <g key="3">{log}<line x1="55" y1="30" x2="118" y2="30" {...rope} />{turn}<path d="M115,70 C130,70 132,55 120,46 L102,33" {...rope} />
            <circle cx="72" cy="31" r="5.5" {...rope} />
            <circle cx="84" cy="31" r="5.5" {...rope} />
            <circle cx="96" cy="31" r="5.5" {...rope} />
            <line x1="118" y1="30" x2="144" y2="30" {...thin} markerEnd="url(#m-timber-3)" />
          </g>,
        ]} />
      );
    }
    default:
      return (
        <Steps id={id} steps={steps} frames={steps.map((_, i) => (
          <g key={i}><line x1="10" y1="55" x2="140" y2="55" {...rope} /></g>
        ))} />
      );
  }
}
