"use client";

// Mini INT1-style chart symbols (paper + ECDIS). Pure SVG, offline-safe.

const M = "#c026d3"; // chart magenta
const INK = "#111";

export function Sym({ id }: { id: string }) {
  const t = "text-[10px] font-bold";
  switch (id) {
    case "light-star":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill={M}><polygon points="40,2 44,18 60,18 47,27 51,43 40,33 29,43 33,27 20,18 36,18" /><circle cx={40} cy={24} r={2.5} fill="#fff" /></g><text x={40} y={51} textAnchor="middle" fontSize={9} fontWeight="bold" fill={INK}>Fl.10s</text></svg>);
    case "major-light":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={M} strokeWidth={2}><path d="M40,4 L40,14 M40,34 L40,44 M18,24 L28,24 M52,24 L62,24 M24,8 L31,15 M49,33 L56,40 M56,8 L49,15 M31,33 L24,40" /></g><polygon points="40,14 43,22 51,22 45,27 47,35 40,30 33,35 35,27 29,22 37,22" fill={M} /></svg>);
    case "lateral-buoy":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><polygon points="40,8 50,24 40,40 30,24" fill="none" stroke={INK} strokeWidth={2} /><circle cx={40} cy={24} r={2.5} fill={INK} /><text x={54} y={28} fontSize={11} fontWeight="bold" fill="#d43d3d">R</text></svg>);
    case "light-vessel":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M18,30 h44 l-6,10 h-32 z" fill="none" stroke={INK} strokeWidth={2} /><line x1={40} y1={30} x2={40} y2={12} stroke={INK} strokeWidth={2} /><polygon points="40,6 42,12 38,12" fill={M} /></svg>);
    case "sounding":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><text x={14} y={24} fontSize={15} fontStyle="italic" fill={INK}>14.6</text><text x={48} y={24} fontSize={15} fill={INK}>3.1</text><line x1={46} y1={28} x2={62} y2={28} stroke={INK} strokeWidth={1.5} /><text x={14} y={44} fontSize={10} fill="#5B7186">italic = below datum</text></svg>);
    case "contour":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M0,40 C20,34 30,44 45,36 C60,28 70,36 80,30" fill="none" stroke="#2456d6" strokeWidth={2} /><path d="M0,20 C20,14 35,24 50,16 C62,10 72,16 80,12" fill="none" stroke="#2456d6" strokeWidth={1} opacity={0.6} /><rect x={0} y={34} width={80} height={18} fill="#2456d6" opacity={0.12} /></svg>);
    case "drying":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={0} y={26} width={80} height={26} fill="#1f9d55" opacity={0.25} /><line x1={0} y1={26} x2={80} y2={26} stroke="#1f9d55" strokeWidth={2} /><text x={40} y={18} textAnchor="middle" fontSize={10} fill={INK}>coast</text></svg>);
    case "seabed":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><text x={8} y={26} fontSize={16} fontWeight="bold" fill={INK}>S.Sh</text><g fill={INK}><circle cx={60} cy={14} r={1.5} /><circle cx={68} cy={20} r={1.5} /><circle cx={58} cy={28} r={1.5} /><circle cx={70} cy={34} r={1.5} /></g></svg>);
    case "wreck-danger":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={INK} strokeWidth={2}><circle cx={40} cy={24} r={17} strokeDasharray="3 3" /><path d="M28,24 h24 m-24,0 l5,-5 m14,5 l5,-5 m-19,10 l5,0 m9,0 l5,0" /></g><text x={40} y={50} textAnchor="middle" fontSize={10} fontWeight="bold" fill={INK}>21 Wk</text></svg>);
    case "wreck-safe":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M22,20 h36 l-7,12 h-22 z" fill="none" stroke={INK} strokeWidth={2} /><text x={40} y={46} textAnchor="middle" fontSize={10} fill={INK}>deep Wk</text></svg>);
    case "rock-awash":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g stroke={INK} strokeWidth={2.5} strokeLinecap="round"><line x1={14} y1={12} x2={26} y2={36} /><line x1={26} y1={12} x2={14} y2={36} /></g><text x={44} y={32} fontSize={18} fontWeight="bold" fill={INK}>+  #</text></svg>);
    case "obstruction":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><text x={10} y={28} fontSize={13} fontWeight="bold" fill={INK}>Obstn</text><text x={10} y={46} fontSize={11} fill={INK}>Foul</text></svg>);
    case "tss":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={M} strokeWidth={2.5}><line x1={6} y1={14} x2={62} y2={14} /><polygon points="62,14 52,9 52,19" fill={M} stroke="none" /><line x1={74} y1={38} x2={18} y2={38} /><polygon points="18,38 28,33 28,43" fill={M} stroke="none" /><line x1={6} y1={26} x2={74} y2={26} strokeDasharray="6 4" strokeWidth={1.5} opacity={0.7} /></g></svg>);
    case "leading":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={8} y1={44} x2={64} y2={8} stroke={M} strokeWidth={2.5} /><circle cx={8} cy={44} r={3} fill={M} /><circle cx={64} cy={8} r={3} fill={M} /><text x={52} y={30} fontSize={10} fontWeight="bold" fill={INK}>058°</text></svg>);
    case "anchorage":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={M} strokeWidth={2.5}><circle cx={40} cy={10} r={4} /><line x1={40} y1={14} x2={40} y2={38} /><line x1={28} y1={22} x2={52} y2={22} /><path d="M26,30 C26,40 34,44 40,44 C46,44 54,40 54,30" /></g></svg>);
    case "pilot":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><circle cx={40} cy={24} r={16} fill="none" stroke={M} strokeWidth={2.5} /><text x={40} y={31} textAnchor="middle" fontSize={18} fontWeight="bold" fill={M}>P</text></svg>);
    case "restricted":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g stroke={M} strokeWidth={2.5}><line x1={6} y1={10} x2={74} y2={10} strokeDasharray="10 4" /><line x1={14} y1={10} x2={14} y2={20} /><line x1={32} y1={10} x2={32} y2={20} /><line x1={50} y1={10} x2={50} y2={20} /><line x1={68} y1={10} x2={68} y2={20} /><line x1={6} y1={42} x2={74} y2={42} strokeDasharray="10 4" /></g></svg>);
    case "cable":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M4,26 C16,14 24,38 36,26 C48,14 56,38 68,26" fill="none" stroke={M} strokeWidth={2.5} /><text x={40} y={48} textAnchor="middle" fontSize={9} fill={INK}>cable area</text></svg>);
    case "safety-contour":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={0} y={0} width={80} height={52} fill="#dbe7ee" /><path d="M0,30 C20,24 35,34 50,28 C62,23 72,28 80,24 L80,52 L0,52 z" fill="#9db9c9" /><path d="M0,30 C20,24 35,34 50,28 C62,23 72,28 80,24" fill="none" stroke="#2456d6" strokeWidth={2.5} /></svg>);
    case "isolated-danger":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={0} y={0} width={80} height={52} fill="#dbe7ee" /><circle cx={40} cy={24} r={5} fill={INK} /><text x={40} y={48} textAnchor="middle" fontSize={18} fontWeight="bold" fill={M}>!</text></svg>);
    case "catoz":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill={M}><polygon points="22,8 24,14 30,14 25,18 27,24 22,20 17,24 19,18 14,14 20,14" /><polygon points="44,8 46,14 52,14 47,18 49,24 44,20 39,24 41,18 36,14 42,14" /><polygon points="66,8 68,14 74,14 69,18 71,24 66,20 61,24 63,18 58,14 64,14" /></g><text x={40} y={44} textAnchor="middle" fontSize={10} fill={INK}>A1 ★★★</text></svg>);
    case "update":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={14} y={8} width={24} height={18} fill="none" stroke="#e07b00" strokeWidth={2} strokeDasharray="4 2" /><text x={26} y={22} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#e07b00">T</text><rect x={46} y={8} width={24} height={18} fill="none" stroke="#c026d3" strokeWidth={2} strokeDasharray="4 2" /><text x={58} y={22} textAnchor="middle" fontSize={12} fontWeight="bold" fill={M}>P</text><text x={40} y={44} textAnchor="middle" fontSize={9} fill={INK}>weekly updates</text></svg>);
    case "overscale":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><defs><pattern id="ovh" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1={0} y1={0} x2={0} y2={8} stroke={M} strokeWidth={2} /></pattern></defs><rect x={8} y={6} width={64} height={40} fill="url(#ovh)" opacity={0.5} stroke={M} strokeWidth={2} /><text x={40} y={30} textAnchor="middle" fontSize={9} fontWeight="bold" fill={INK}>OVERSCALE</text></svg>);
    case "caution-box":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={8} y={6} width={64} height={40} fill="none" stroke={M} strokeWidth={2} strokeDasharray="6 3" /><text x={40} y={34} textAnchor="middle" fontSize={20} fontWeight="bold" fill={M}>!</text></svg>);
    case "tidal-stream":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g stroke={M} strokeWidth={2.5} fill="none"><line x1={10} y1={30} x2={58} y2={30} /><polygon points="58,30 48,25 48,35" fill={M} stroke="none" /><line x1={18} y1={30} x2={14} y2={20} /><line x1={26} y1={30} x2={22} y2={20} /></g><text x={64} y={28} fontSize={12} fontWeight="bold" fill={INK}>A</text><text x={40} y={48} textAnchor="middle" fontSize={9} fill={INK}>2.5 kn</text></svg>);
    case "current":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g stroke={INK} strokeWidth={2.5} fill="none"><line x1={10} y1={26} x2={58} y2={26} /><polygon points="58,26 48,21 48,31" fill={INK} stroke="none" /></g><text x={40} y={46} textAnchor="middle" fontSize={10} fill={INK}>1.2 kn</text></svg>);
    case "overfalls":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={INK} strokeWidth={2}><path d="M6,16 q7,-7 14,0 t14,0 t14,0 t14,0" /><path d="M6,28 q7,-7 14,0 t14,0 t14,0 t14,0" opacity={0.7} /><path d="M6,40 q7,-7 14,0 t14,0 t14,0 t14,0" opacity={0.4} /></g></svg>);
    case "eddies":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M55,26 a15,15 0 1,1 -15,-15" fill="none" stroke={INK} strokeWidth={2.5} /><polygon points="40,6 46,16 35,15" fill={INK} /><circle cx={40} cy={26} r={3} fill={INK} /></svg>);
    case "landmark":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g fill="none" stroke={INK} strokeWidth={2}><rect x={33} y={18} width={14} height={24} /><polygon points="31,18 49,18 40,6" /><line x1={40} y1={6} x2={40} y2={2} /></g><circle cx={40} cy={42} r={2.5} fill={M} /><text x={56} y={30} fontSize={9} fill={INK}>Ch</text></svg>);
    case "beacon-tower":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><g stroke={INK} strokeWidth={2}><polygon points="28,44 34,10 40,10 46,44" fill="none" /><line x1={28} y1={36} x2={46} y2={36} /><line x1={31} y1={24} x2={43} y2={24} /></g><circle cx={37} cy={46} r={2.5} fill={M} /></svg>);
    case "reported":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><circle cx={30} cy={24} r={12} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="4 3" /><text x={52} y={30} fontSize={13} fontWeight="bold" fill={INK}>PA</text></svg>);
    case "swept":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={6} y={8} width={68} height={30} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 3" /><text x={40} y={28} textAnchor="middle" fontSize={11} fontWeight="bold" fill={INK}>sw 12m</text></svg>);
    case "leading-pair":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={14} y1={44} x2={60} y2={10} stroke={M} strokeWidth={2} /><polygon points="14,36 17,44 11,44" fill={M} /><polygon points="60,2 63,10 57,10" fill={M} /><text x={30} y={22} fontSize={9} fontWeight="bold" fill={INK}>Front</text><text x={52} y={34} fontSize={9} fontWeight="bold" fill={INK}>Rear</text></svg>);
    case "sectors":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M40,44 L12,16 A40,40 0 0,1 40,4 z" fill="#d43d3d" opacity={0.75} /><path d="M40,44 L40,4 A40,40 0 0,1 68,16 z" fill="#1f9d55" opacity={0.75} /><path d="M12,16 A40,40 0 0,1 68,16 L40,44 z" fill="#fff" stroke={INK} strokeWidth={1} opacity={0.85} /><circle cx={40} cy={44} r={3.5} fill={M} /></svg>);
    case "fogsignal":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><path d="M14,20 h14 l10,-8 v28 l-10,-8 h-14 z" fill="none" stroke={INK} strokeWidth={2.5} /><path d="M44,18 q8,8 0,16 M50,13 q13,13 0,26" fill="none" stroke={M} strokeWidth={2.5} /><text x={40} y={50} textAnchor="middle" fontSize={9} fill={INK}>Horn Mo(K)</text></svg>);
    case "unlit-beacon":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={40} y1={22} x2={40} y2={46} stroke={INK} strokeWidth={3} /><polygon points="40,4 50,22 30,22" fill="none" stroke={INK} strokeWidth={2.5} /><circle cx={40} cy={46} r={2.5} fill={M} /></svg>);
    case "dw-route":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={4} y1={26} x2={76} y2={26} stroke={M} strokeWidth={4} strokeDasharray="12 5" /><text x={40} y={18} textAnchor="middle" fontSize={11} fontWeight="bold" fill={INK}>DW</text></svg>);
    case "ferry":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={6} y1={26} x2={74} y2={26} stroke={M} strokeWidth={2.5} strokeDasharray="2 5" strokeLinecap="round" /><polygon points="40,20 48,26 40,32 44,26" fill={M} /></svg>);
    case "ais-aton":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><polygon points="32,8 48,24 32,40 16,24" fill="none" stroke={INK} strokeWidth={2.5} /><circle cx={32} cy={24} r={2.5} fill={INK} /><text x={54} y={28} fontSize={11} fontWeight="bold" fill={M}>AIS</text></svg>);
    case "v-ais":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><polygon points="30,8 46,24 30,40 14,24" fill="none" stroke={INK} strokeWidth={2} strokeDasharray="5 3" /><text x={52} y={28} fontSize={11} fontWeight="bold" fill={M}>V-AIS</text></svg>);
    case "dumping":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={6} y={6} width={68} height={34} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 3" /><text x={40} y={27} textAnchor="middle" fontSize={10} fontWeight="bold" fill={INK}>Dumping gd</text></svg>);
    case "farm":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><rect x={10} y={6} width={60} height={34} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 3" /><g stroke={INK} strokeWidth={1.5}><line x1={22} y1={14} x2={30} y2={22} /><line x1={30} y1={14} x2={22} y2={22} /><line x1={38} y1={14} x2={46} y2={22} /><line x1={46} y1={14} x2={38} y2={22} /><line x1={54} y1={14} x2={62} y2={22} /><line x1={62} y1={14} x2={54} y2={22} /></g></svg>);
    case "seaplane":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><ellipse cx={40} cy={24} rx={30} ry={16} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 3" /><path d="M28,24 h24 m-6,-5 l6,5 l-6,5" fill="none" stroke={M} strokeWidth={2.5} /></svg>);
    case "dredged":
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><line x1={4} y1={16} x2={76} y2={16} stroke={INK} strokeWidth={1.5} strokeDasharray="8 3 2 3" /><line x1={4} y1={36} x2={76} y2={36} stroke={INK} strokeWidth={1.5} strokeDasharray="8 3 2 3" /><text x={40} y={30} textAnchor="middle" fontSize={10} fontWeight="bold" fill={INK}>Dredged 14m</text></svg>);
    default:
      return (<svg viewBox="0 0 80 52" className="h-12 w-20"><text x={40} y={28} textAnchor="middle" fontSize={12} fill={INK}>?</text></svg>);
  }
}
