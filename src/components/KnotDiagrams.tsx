// Schematic rope diagrams for seamanship knots — stylised study drawings,
// not to scale. Steps carry the teaching; confirm with hands-on drill.
const ROPE = "#c9a227";
const POST = "#64748b";
const frame = { stroke: "#0f172a", strokeWidth: 1 };

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" role="img" aria-label="knot diagram">
      <rect x="0" y="0" width="120" height="80" fill="#ffffff" rx="8" {...frame} />
      {children}
    </svg>
  );
}

export function KnotFigure({ id }: { id: string }) {
  const rope = { stroke: ROPE, strokeWidth: 7, fill: "none", strokeLinecap: "round" as const };
  switch (id) {
    case "bowline":
      return (
        <Wrap>
          <line x1="95" y1="78" x2="95" y2="8" {...rope} />
          <circle cx="55" cy="45" r="20" {...rope} />
          <circle cx="80" cy="36" r="8" {...rope} />
          <path d="M80 44 C72 54 64 58 56 58" {...rope} />
        </Wrap>
      );
    case "clove":
      return (
        <Wrap>
          <rect x="55" y="5" width="10" height="70" rx="5" fill={POST} {...frame} />
          <line x1="5" y1="40" x2="115" y2="40" {...rope} />
          <line x1="46" y1="18" x2="74" y2="62" {...rope} />
          <line x1="74" y1="18" x2="46" y2="62" {...rope} />
        </Wrap>
      );
    case "reef":
      return (
        <Wrap>
          <circle cx="40" cy="40" r="12" {...rope} />
          <circle cx="80" cy="40" r="12" {...rope} />
          <line x1="28" y1="40" x2="5" y2="40" {...rope} />
          <line x1="92" y1="40" x2="115" y2="40" {...rope} />
          <line x1="40" y1="52" x2="40" y2="72" {...rope} />
          <line x1="80" y1="28" x2="80" y2="8" {...rope} />
        </Wrap>
      );
    case "eight":
      return (
        <Wrap>
          <path d="M30 72 C30 48 58 48 58 32 C58 18 78 18 78 32 C78 48 100 42 104 60" {...rope} />
          <line x1="104" y1="60" x2="112" y2="72" {...rope} />
        </Wrap>
      );
    case "sheet":
      return (
        <Wrap>
          <path d="M115 18 C88 18 84 34 84 50 C84 66 88 74 112 74" {...rope} />
          <circle cx="84" cy="50" r="10" {...rope} />
          <line x1="20" y1="50" x2="74" y2="50" {...rope} />
          <path d="M84 60 C80 68 70 70 60 68" {...rope} />
        </Wrap>
      );
    case "rolling":
      return (
        <Wrap>
          <rect x="15" y="32" width="90" height="12" rx="6" fill={POST} {...frame} />
          <line x1="60" y1="5" x2="60" y2="32" {...rope} />
          <line x1="52" y1="20" x2="68" y2="46" {...rope} />
          <line x1="60" y1="20" x2="76" y2="46" {...rope} />
          <line x1="68" y1="20" x2="84" y2="46" {...rope} />
          <line x1="84" y1="46" x2="110" y2="60" {...rope} />
        </Wrap>
      );
    case "roundturn":
      return (
        <Wrap>
          <rect x="55" y="5" width="10" height="50" rx="5" fill={POST} {...frame} />
          <circle cx="60" cy="42" r="22" {...rope} />
          <line x1="60" y1="8" x2="60" y2="20" {...rope} />
          <path d="M60 64 C60 70 70 70 70 64 M70 64 C70 70 80 70 80 64" {...rope} />
        </Wrap>
      );
    case "timber":
      return (
        <Wrap>
          <rect x="10" y="30" width="100" height="18" rx="9" fill={POST} {...frame} />
          <path d="M40 30 C30 20 30 60 42 52" {...rope} />
          <line x1="42" y1="52" x2="70" y2="60" {...rope} />
          <line x1="48" y1="48" x2="74" y2="55" {...rope} />
          <line x1="70" y1="60" x2="95" y2="66" {...rope} />
        </Wrap>
      );
    default:
      return (
        <Wrap>
          <line x1="10" y1="40" x2="110" y2="40" {...rope} />
        </Wrap>
      );
  }
}
