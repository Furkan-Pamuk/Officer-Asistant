// ICS signal-flag schematics (verified against ICS blazons) + Morse glyphs.
// Simplified study drawings — confirm hoist details with the ICS book on board.
export function FlagFigure({ code, size = 56 }: { code: string; size?: number }) {
  const H = 20;
  const swallow = "0,0 30,0 22,10 30,20 0,20";
  const pennant = "0,0 36,10 0,20";
  const BLUE = "#0b3bd6";
  const RED = "#e02020";
  const YELLOW = "#ffd500";
  const BLACK = "#161616";
  const WHITE = "#ffffff";
  const frame = { stroke: "#0f172a", strokeWidth: 1 };

  const letter = (inner: React.ReactNode) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" role="img" aria-label={`signal flag ${code}`}>
      <rect x="0" y="0" width="30" height="20" fill={WHITE} {...frame} />
      {inner}
      <rect x="0" y="0" width="30" height="20" fill="none" {...frame} />
    </svg>
  );
  const letterSwallow = (left: string, right: string) => (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" role="img" aria-label={`signal flag ${code}`}>
      <polygon points={swallow} fill={left} />
      <polygon points={`15,0 30,0 22,10 30,20 15,20`} fill={right} />
      <polygon points={swallow} fill="none" {...frame} />
    </svg>
  );
  const burgee = (inner: React.ReactNode) => (
    <svg width={size} height={(size * 5) / 9} viewBox="0 0 36 20" role="img" aria-label={`signal pennant ${code}`}>
      <defs>
        <clipPath id={`pen-${code}`}>
          <polygon points={pennant} />
        </clipPath>
      </defs>
      <polygon points={pennant} fill={WHITE} />
      <g clipPath={`url(#pen-${code})`}>{inner}</g>
      <polygon points={pennant} fill="none" {...frame} />
    </svg>
  );

  const saltire = (bg: string, fg: string) =>
    letter(
      <>
        <rect x="0" y="0" width="30" height="20" fill={bg} />
        <line x1="1" y1="1" x2="29" y2="19" stroke={fg} strokeWidth="4" />
        <line x1="29" y1="1" x2="1" y2="19" stroke={fg} strokeWidth="4" />
      </>
    );
  const greekCross = (bg: string, fg: string) =>
    letter(
      <>
        <rect x="0" y="0" width="30" height="20" fill={bg} />
        <rect x="12" y="0" width="6" height="20" fill={fg} />
        <rect x="0" y="7" width="30" height="6" fill={fg} />
      </>
    );

  switch (code) {
    case "A":
      return letterSwallow(WHITE, BLUE);
    case "B":
      return letterSwallow(RED, RED);
    case "C":
      return letter(
        <>
          {[BLUE, WHITE, RED, WHITE, BLUE].map((c, i) => (
            <rect key={i} x="0" y={i * 4} width="30" height="4" fill={c} />
          ))}
        </>
      );
    case "D":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={YELLOW} />
          <rect x="0" y="6" width="30" height="8" fill={BLUE} />
        </>
      );
    case "E":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="10" fill={BLUE} />
          <rect x="0" y="10" width="30" height="10" fill={RED} />
        </>
      );
    case "F":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={WHITE} />
          <polygon points="15,0 30,10 15,20 0,10" fill={RED} />
        </>
      );
    case "G":
      return letter(
        <>
          {[YELLOW, BLUE, YELLOW, BLUE, YELLOW, BLUE].map((c, i) => (
            <rect key={i} x={i * 5} y="0" width="5" height="20" fill={c} />
          ))}
        </>
      );
    case "H":
      return letter(
        <>
          <rect x="0" y="0" width="15" height="20" fill={WHITE} />
          <rect x="15" y="0" width="15" height="20" fill={RED} />
        </>
      );
    case "I":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={YELLOW} />
          <circle cx="15" cy="10" r="5" fill={BLACK} />
        </>
      );
    case "J":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={BLUE} />
          <rect x="0" y="7" width="30" height="6" fill={WHITE} />
        </>
      );
    case "K":
      return letter(
        <>
          <rect x="0" y="0" width="15" height="20" fill={YELLOW} />
          <rect x="15" y="0" width="15" height="20" fill={BLUE} />
        </>
      );
    case "L":
      return letter(
        <>
          <rect x="0" y="0" width="15" height="10" fill={YELLOW} />
          <rect x="15" y="0" width="15" height="10" fill={BLACK} />
          <rect x="0" y="10" width="15" height="10" fill={BLACK} />
          <rect x="15" y="10" width="15" height="10" fill={YELLOW} />
        </>
      );
    case "M":
      return saltire(BLUE, WHITE);
    case "N":
      return letter(
        <>
          {Array.from({ length: 16 }, (_, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            return <rect key={i} x={c * 7.5} y={r * 5} width="7.5" height="5" fill={(r + c) % 2 === 0 ? BLUE : WHITE} />;
          })}
        </>
      );
    case "O":
      return letter(
        <>
          <polygon points="0,0 30,0 30,20" fill={RED} />
          <polygon points="0,0 30,20 0,20" fill={YELLOW} />
        </>
      );
    case "P":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={BLUE} />
          <rect x="10" y="5" width="10" height="10" fill={WHITE} />
        </>
      );
    case "Q":
      return letter(<rect x="0" y="0" width="30" height="20" fill={YELLOW} />);
    case "R":
      return greekCross(RED, YELLOW);
    case "S":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={WHITE} />
          <rect x="10" y="5" width="10" height="10" fill={BLUE} />
        </>
      );
    case "T":
      return letter(
        <>
          <rect x="0" y="0" width="10" height="20" fill={RED} />
          <rect x="10" y="0" width="10" height="20" fill={WHITE} />
          <rect x="20" y="0" width="10" height="20" fill={BLUE} />
        </>
      );
    case "U":
      return letter(
        <>
          <rect x="0" y="0" width="15" height="10" fill={RED} />
          <rect x="15" y="0" width="15" height="10" fill={WHITE} />
          <rect x="0" y="10" width="15" height="10" fill={WHITE} />
          <rect x="15" y="10" width="15" height="10" fill={RED} />
        </>
      );
    case "V":
      return saltire(WHITE, RED);
    case "W":
      return letter(
        <>
          <rect x="0" y="0" width="30" height="20" fill={BLUE} />
          <rect x="9" y="4" width="12" height="12" fill={WHITE} />
          <rect x="11" y="6" width="8" height="8" fill={RED} />
        </>
      );
    case "X":
      return greekCross(WHITE, BLUE);
    case "Y":
      return letter(
        <g transform="rotate(-33.69 15 10)">
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="-12" y={i * 2} width="54" height="2" fill={i % 2 === 0 ? YELLOW : RED} />
          ))}
        </g>
      );
    case "Z":
      return letter(
        <>
          <polygon points="0,0 30,0 15,10" fill={YELLOW} />
          <polygon points="30,0 30,20 15,10" fill={BLACK} />
          <polygon points="0,20 30,20 15,10" fill={RED} />
          <polygon points="0,0 0,20 15,10" fill={BLUE} />
        </>
      );
    case "0":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="20" fill={YELLOW} />
          <rect x="14" y="0" width="8" height="20" fill={RED} />
        </>
      );
    case "1":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="20" fill={WHITE} />
          <circle cx="12" cy="10" r="5" fill={RED} />
        </>
      );
    case "2":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="20" fill={BLUE} />
          <circle cx="12" cy="10" r="5" fill={WHITE} />
        </>
      );
    case "3":
      return burgee(
        <>
          <rect x="0" y="0" width="12" height="20" fill={RED} />
          <rect x="12" y="0" width="12" height="20" fill={WHITE} />
          <rect x="24" y="0" width="12" height="20" fill={BLUE} />
        </>
      );
    case "4":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="20" fill={RED} />
          <rect x="9.5" y="4" width="4" height="12" fill={WHITE} />
          <rect x="5" y="8" width="13" height="4" fill={WHITE} />
        </>
      );
    case "5":
      return burgee(
        <>
          <rect x="0" y="0" width="18" height="20" fill={YELLOW} />
          <rect x="18" y="0" width="18" height="20" fill={BLUE} />
        </>
      );
    case "6":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="10" fill={BLACK} />
          <rect x="0" y="10" width="36" height="10" fill={WHITE} />
        </>
      );
    case "7":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="10" fill={YELLOW} />
          <rect x="0" y="10" width="36" height="10" fill={RED} />
        </>
      );
    case "8":
      return burgee(
        <>
          <rect x="0" y="0" width="36" height="20" fill={WHITE} />
          <rect x="9.5" y="4" width="4" height="12" fill={RED} />
          <rect x="5" y="8" width="13" height="4" fill={RED} />
        </>
      );
    case "9":
      return burgee(
        <>
          <rect x="0" y="0" width="18" height="10" fill={WHITE} />
          <rect x="18" y="0" width="18" height="10" fill={BLACK} />
          <rect x="0" y="10" width="18" height="10" fill={RED} />
          <rect x="18" y="10" width="18" height="10" fill={YELLOW} />
        </>
      );
    case "ANS":
      return burgee(
        <>
          {[RED, WHITE, RED, WHITE, RED].map((c, i) => (
            <rect key={i} x={i * 7.2} y="0" width="7.2" height="20" fill={c} />
          ))}
        </>
      );
    case "REP1":
      return burgee(
        <>
          <polygon points={pennant} fill={BLUE} />
          <polygon points="5,3.5 36,10 5,16.5" fill={YELLOW} />
        </>
      );
    case "REP2":
      return burgee(
        <>
          <polygon points="0,0 18,5 18,15 0,20" fill={BLUE} />
          <polygon points="18,5 36,10 18,15" fill={WHITE} />
        </>
      );
    case "REP3":
      return burgee(
        <>
          <polygon points={pennant} fill={WHITE} />
          <rect x="0" y="7" width="36" height="6" fill={BLACK} />
        </>
      );
    default:
      return (
        <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" role="img" aria-label="unknown flag">
          <rect x="0" y="0" width="30" height="20" fill="#e5e5e5" stroke="#0f172a" />
        </svg>
      );
  }
}

export function MorseCode({ code, dark = false }: { code: string; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`morse ${code}`}>
      {code.split("").map((s, i) =>
        s === "." ? (
          <span
            key={i}
            style={{ width: 7, height: 7, borderRadius: 9999, background: dark ? "#fff" : "#0f172a" }}
          />
        ) : s === "−" || s === "-" ? (
          <span
            key={i}
            style={{ width: 18, height: 7, borderRadius: 9999, background: dark ? "#fff" : "#0f172a" }}
          />
        ) : (
          <span key={i} style={{ width: 5 }} />
        )
      )}
    </span>
  );
}
