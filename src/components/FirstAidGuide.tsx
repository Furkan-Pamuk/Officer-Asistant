import { FIRST_AID } from "@/lib/sar-data";

function Pic({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 120 90" className="h-auto w-full rounded-xl bg-white ring-1 ring-amber-200" role="img" aria-label={label}>
      <rect x="0" y="0" width="120" height="90" fill="#ffffff" rx="8" />
      {children}
    </svg>
  );
}

function RecoveryPic() {
  return (
    <Pic label="Recovery position">
      <circle cx="28" cy="30" r="10" fill="#0f172a" />
      <rect x="38" y="22" width="52" height="16" rx="8" fill="#0f172a" />
      <rect x="52" y="38" width="12" height="34" rx="6" fill="#0f172a" />
      <rect x="70" y="44" width="12" height="28" rx="6" fill="#0f172a" />
      <path d="M95,20 C105,30 105,55 95,65" fill="none" stroke="#dc2626" strokeWidth="3" markerEnd="url(#ra)" />
      <defs><marker id="ra" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#dc2626" strokeWidth="1.4" /></marker></defs>
      <text x="60" y="86" textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">on side · airway open</text>
    </Pic>
  );
}

function CprPic() {
  return (
    <Pic label="CPR hand position">
      <rect x="35" y="12" width="50" height="66" rx="14" fill="none" stroke="#0f172a" strokeWidth="5" />
      <circle cx="60" cy="45" r="11" fill="none" stroke="#dc2626" strokeWidth="3" />
      <path d="M60,22 L60,34 M60,56 L60,68" stroke="#dc2626" strokeWidth="3" />
      <text x="60" y="86" textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">centre of chest · 5–6 cm</text>
    </Pic>
  );
}

function ChokePic() {
  return (
    <Pic label="Abdominal thrusts">
      <rect x="38" y="10" width="44" height="60" rx="14" fill="none" stroke="#0f172a" strokeWidth="5" />
      <circle cx="60" cy="45" r="8" fill="#dc2626" />
      <path d="M60,53 L60,72" stroke="#dc2626" strokeWidth="3" markerEnd="url(#ca)" />
      <defs><marker id="ca" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#dc2626" strokeWidth="1.4" /></marker></defs>
      <text x="60" y="86" textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">fist above navel · pull in-up</text>
    </Pic>
  );
}

function BleedPic() {
  return (
    <Pic label="Direct pressure">
      <rect x="15" y="38" width="90" height="16" rx="8" fill="#0f172a" />
      <path d="M60,38 L60,26" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
      <path d="M48,26 L72,26" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
      <text x="60" y="76" textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">press hard · don't lift</text>
      <text x="60" y="86" textAnchor="middle" fontSize="9" fontWeight="800" fill="#475569">note tourniquet time</text>
    </Pic>
  );
}

const PICS: Record<string, React.ReactNode> = {
  recovery: <RecoveryPic />,
  drsabcd: <CprPic />,
  choking: <ChokePic />,
  bleeding: <BleedPic />,
};

export default function FirstAidGuide() {
  return (
    <div className="grid gap-3">
      {FIRST_AID.map((s) => (
        <div key={s.id} className="rounded-2xl border bg-white p-4">
          <h2 className="font-bold">{s.title}</h2>
          {PICS[s.id] && <div className="mt-2 max-w-52">{PICS[s.id]}</div>}
          <ol className="mt-2 grid gap-1.5">
            {s.points.map((p, i) => (
              <li key={i} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
                <span className="font-black">{i + 1}.</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <p className="text-xs opacity-60">Study notes — not a substitute for STCW Elementary First Aid training. Ship&apos;s medicine chest per flag requirements; MFAG (IMDG Supplement) and WHO Medical Guide for Ships govern treatment; call TMAS early.</p>
    </div>
  );
}
