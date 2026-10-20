"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EMERGENCY_CARDS, LIGHTS_BUOYS, CHART_SYMBOLS, WEATHER_NOTES, MASTER_STANDING_ORDERS, PHONETIC, PHONETIC_NUMERALS, SIGNAL_NOTES, MORSE_LETTERS, MORSE_PROSIGNS, MORSE_NOTES, COLREG_SECTIONS, type EmergencyCard } from "@/lib/navigation-documents";
import { FlagFigure, MorseCode } from "@/components/SignalFlags";
import { CardinalGrid, LateralRow, OtherMarksRow, RhythmList } from "@/components/BuoyDiagrams";
import { BeaufortTable, CloudGallery, FrontSymbols, TwelfthsStrip } from "@/components/WeatherDiagrams";
import { Sym } from "@/components/ChartSymbols";

const SIG_KEY = "oa-navdoc-sig";
const TICK_KEY = "oa-navdoc-ticks";

type Sig = { vessel: string; master: string; date: string };

function loadSig(): Sig {
  try {
    const raw = localStorage.getItem(SIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { vessel: "", master: "", date: new Date().toISOString().slice(0, 10) };
}

function loadTicks(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(TICK_KEY) ?? "{}");
  } catch { return {}; }
}

async function shareText(title: string, text: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    alert("Copied — paste anywhere to share.");
  } catch { /* user cancelled or clipboard blocked */ }
}

function buildOrdersText(): string {
  const sig = loadSig();
  const head = `MASTER STANDING ORDERS — M/V ${sig.vessel || "…………"} (Master: ${sig.master || "…………"}, Date: ${sig.date || "…………"})\n`;
  const body = MASTER_STANDING_ORDERS.map((g, gi) =>
    `\n${gi + 1}. ${g.group.toUpperCase()}\n` + g.orders.map((o, i) => `${gi + 1}.${i + 1} ${o}`).join("\n")
  ).join("\n");
  return head + body + "\n\n— via Shark";
}

function Orders() {
  const [sig, setSig] = useState<Sig>({ vessel: "", master: "", date: "" });
  useEffect(() => { setSig(loadSig()); }, []);
  function save(next: Sig) {
    setSig(next);
    try { localStorage.setItem(SIG_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  const inp = "rounded-xl border px-3 py-2 text-sm w-full";

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Master Standing Orders", buildOrdersText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950 print:border-black">
        <h2 className="font-black">✍️ Master's signature block</h2>
        <p className="mt-1 opacity-70">Shown on print. Standing orders take effect only when signed by the Master.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3 print:hidden">
          <input value={sig.vessel} onChange={(e) => save({ ...sig, vessel: e.target.value })} placeholder="M/V …" className={inp} />
          <input value={sig.master} onChange={(e) => save({ ...sig, master: e.target.value })} placeholder="Master's name" className={inp} />
          <input type="date" value={sig.date} onChange={(e) => save({ ...sig, date: e.target.value })} className={inp} />
        </div>
        <div className="mt-3 hidden border-t border-amber-200 pt-2 font-bold print:block dark:border-red-950">
          M/V {sig.vessel || "…………"} — Master: {sig.master || "…………"} — Date: {sig.date || "…………"}
        </div>
      </div>
      {MASTER_STANDING_ORDERS.map((g, gi) => (
        <div key={g.group} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black">
          <h2 className="font-black">{gi + 1}. {g.group}</h2>
          <ol className="mt-2 grid gap-2 text-sm leading-relaxed">
            {g.orders.map((o, i) => (
              <li key={i} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
                <span className="font-black">{gi + 1}.{i + 1}</span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
      <p className="text-xs opacity-60 print:block">Generic good-seamanship orders per ICS Bridge Procedures Guide — adapt to vessel SMS and sign on board. Always follow the official SMS.</p>
    </div>
  );
}

function buildCardText(c: EmergencyCard): string {
  return `${c.icon} EMERGENCY CHECK CARD — ${c.title.toUpperCase()}\n🔔 ${c.alarm}\n\n` +
    c.steps.map((s, i) => `${i + 1}. ${s}`).join("\n") +
    `\n\nAfter: ${c.after.join(" • ")}\n📖 ${c.reference}\n\n— via Shark`;
}

function Cards() {
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<string | null>("fire");
  useEffect(() => { setTicks(loadTicks()); }, []);
  function toggle(key: string) {
    const next = { ...ticks, [key]: !ticks[key] };
    setTicks(next);
    try { localStorage.setItem(TICK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  function resetCard(id: string) {
    const next = { ...ticks };
    EMERGENCY_CARDS.find((c) => c.id === id)?.steps.forEach((_, i) => delete next[`${id}:${i}`]);
    setTicks(next);
    try { localStorage.setItem(TICK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <p className="flex-1 text-sm opacity-70">Tick steps during drills — ticks are saved on this device.</p>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      {EMERGENCY_CARDS.map((c) => {
        const done = c.steps.filter((_, i) => ticks[`${c.id}:${i}`]).length;
        const isOpen = open === c.id;
        return (
          <div key={c.id} className="overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
            <button onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="text-2xl">{c.icon}</span>
              <span className="flex-1">
                <span className="block font-black">{c.title}</span>
                <span className="block text-xs font-bold opacity-60">🔔 {c.alarm}</span>
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black dark:bg-red-950">{done}/{c.steps.length}</span>
              <span className="font-black">{isOpen ? "▴" : "▾"}</span>
            </button>
            {(isOpen) && (
              <div className="border-t border-amber-200 p-4 dark:border-red-950 print:block">
                <ol className="grid gap-1.5 text-sm">
                  {c.steps.map((s, i) => {
                    const key = `${c.id}:${i}`;
                    const on = !!ticks[key];
                    return (
                      <li key={i}>
                        <button onClick={() => toggle(key)} className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left ${on ? "bg-amber-100 font-bold line-through opacity-70 dark:bg-red-950" : "bg-amber-50/60 dark:bg-black dark:ring-1 dark:ring-red-950"} print:bg-transparent print:font-normal print:no-underline print:opacity-100 print:ring-0`}>
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 font-black print:hidden ${on ? "border-stone-900 bg-stone-900 text-amber-50 dark:border-red-500 dark:bg-red-700" : "border-stone-400"}`}>{on ? "✓" : ""}</span>
                          <span><strong className="mr-1">{i + 1}.</strong>{s}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-3 grid gap-1 text-sm">
                  <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-amber-200 dark:bg-black dark:ring-red-950 print:ring-0">
                    <strong>After: </strong>{c.after.join(" • ")}
                  </div>
                  <div className="px-1 text-xs font-bold opacity-60">📖 {c.reference}</div>
                </div>
                <button onClick={() => resetCard(c.id)} className="mt-2 rounded-full border px-3 py-1 text-xs font-bold print:hidden">↺ Reset ticks</button>
                <button onClick={() => shareText(`Emergency Card — ${c.title}`, buildCardText(c))} className="ml-2 mt-2 rounded-full border bg-white px-3 py-1 text-xs font-bold dark:bg-black print:hidden">📤 Share card</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildLightsText(): string {
  return "LIGHTS & BUOYS — WORKING NOTES\n" +
    LIGHTS_BUOYS.map((s) => `\n${s.heading.toUpperCase()}\n` + s.points.map((p, i) => `• ${p}`).join("\n")).join("\n") +
    "\n\n— via Shark";
}

function LightsBuoys() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Lights & Buoys — working notes", buildLightsText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      {LIGHTS_BUOYS.map((s, i) => (
        <div key={s.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {i + 1}. {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
          {i === 0 && <LateralRow />}
          {i === 1 && <CardinalGrid />}
          {i === 2 && <OtherMarksRow />}
          {i === 3 && <RhythmList />}
        </div>
      ))}
      <p className="text-xs opacity-60">Study/reference notes per IALA Maritime Buoyage System + Admiralty List of Lights conventions — always confirm with the current chart and List of Lights.</p>
    </div>
  );
}

function buildSymbolsText(): string {
  return "CHART SYMBOLS — PAPER & ECDIS\n" +
    CHART_SYMBOLS.map((g) => `\n${g.heading.toUpperCase()}\n` + g.symbols.map((s) => `• ${s.name}: ${s.meaning}`).join("\n")).join("\n") +
    "\n\nPer INT1 / S-52 conventions — always confirm with current chart & ENCs. — via Shark";
}

function ChartSymbols() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Chart symbols — paper & ECDIS", buildSymbolsText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      {CHART_SYMBOLS.map((g, i) => (
        <div key={g.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{g.icon} {i + 1}. {g.heading}</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {g.symbols.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
                <span className="shrink-0 rounded-lg bg-white p-1 ring-1 ring-amber-200 dark:bg-neutral-900 dark:ring-red-950 print:ring-black"><Sym id={s.id} /></span>
                <div className="text-sm leading-snug"><strong>{s.name}</strong><p className="opacity-80">{s.meaning}</p></div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs opacity-60">Schematic drawings per INT1 (paper) + S-52 (ECDIS) conventions — always confirm with the current chart and List of Lights.</p>
    </div>
  );
}

function buildWeatherText(): string {
  return "WEATHER & SEA — WORKING NOTES\n" +
    WEATHER_NOTES.map((s) => `\n${s.heading.toUpperCase()}\n` + s.points.map((p) => `• ${p}`).join("\n")).join("\n") +
    "\n\n— via Shark";
}

function WeatherSea() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Weather & Sea — working notes", buildWeatherText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">☁️ 1. Cloud types — read the sky</h2>
        <CloudGallery />
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">🌪️ 2. Beaufort scale — wind & shipboard action</h2>
        <BeaufortTable />
      </div>
      {WEATHER_NOTES.map((s, i) => (
        <div key={s.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {i + 3}. {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
          {i === 0 && <FrontSymbols />}
          {i === 1 && <TwelfthsStrip />}
        </div>
      ))}
      <p className="text-xs opacity-60">Working notes per WMO cloud atlas + standard seamanship practice — always use official forecasts (NAVTEX, SafetyNET, MSI) for decisions.</p>
    </div>
  );
}

function buildSignalsText(): string {
  return "PHONETIC ALPHABET + SIGNAL FLAGS\n" +
    PHONETIC.map((p) => `${p.letter} ${p.word} (${p.say}) ${p.morse} — ${p.flag}`).join("\n") +
    "\n\nNumerals: " + PHONETIC_NUMERALS.map((n) => `${n.digit} ${n.word} ${n.morse}`).join(" • ") +
    "\n\n— via Shark";
}

function Signals() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Phonetic alphabet + signal flags", buildSignalsText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {PHONETIC.map((p) => (
          <div key={p.letter} className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
            <span className="shrink-0 rounded-lg bg-white p-1 ring-1 ring-amber-200 dark:bg-neutral-900 dark:ring-red-950 print:ring-black"><FlagFigure code={p.letter} /></span>
            <div className="text-sm leading-snug">
              <strong className="text-base">{p.letter} — {p.word}</strong>
              <span className="ml-2 opacity-60">({p.say})</span>
              <div className="mt-1"><MorseCode code={p.morse} /></div>
              <p className="mt-1 opacity-80">🚩 {p.flag}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">🔢 Numeral pennants</h2>
        <div className="mt-2 flex flex-wrap gap-3">
          {PHONETIC_NUMERALS.map((n) => (
            <div key={n.digit} className="grid justify-items-center gap-1 text-xs font-bold">
              <FlagFigure code={n.digit} size={64} />
              <span>{n.digit} {n.word}</span>
              <MorseCode code={n.morse} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
          <span className="grid justify-items-center gap-1"><FlagFigure code="ANS" size={64} />Answer</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP1" size={64} />1st sub</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP2" size={64} />2nd sub</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP3" size={64} />3rd sub</span>
        </div>
      </div>
      {SIGNAL_NOTES.map((s) => (
        <div key={s.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs opacity-60">Flag designs per ICS blazons; single-flag meanings per the International Code of Signals — confirm hoists with the ICS book on board.</p>
    </div>
  );
}

function buildMorseText(): string {
  return "MORSE CODE — LETTERS & PROSIGNS\n" +
    MORSE_LETTERS.map((m) => `${m.ch} ${m.code}`).join("  ") +
    "\n\n" + MORSE_PROSIGNS.map((p) => `${p.sign} ${p.code}: ${p.meaning}`).join("\n") +
    "\n\nNumerals: " + PHONETIC_NUMERALS.map((n) => `${n.digit} ${n.morse}`).join("  ") +
    "\n\nDit=1, dah=3, letter gap=3, word gap=7. — via Shark";
}

function Morse() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Morse code", buildMorseText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">🔤 Letters</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MORSE_LETTERS.map((m) => (
            <div key={m.ch} className="flex items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-lg font-black text-amber-50 dark:bg-red-700 dark:text-white print:border print:border-black print:bg-transparent print:text-black">{m.ch}</span>
              <MorseCode code={m.code} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">🔢 Numerals</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PHONETIC_NUMERALS.map((n) => (
            <div key={n.digit} className="flex items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-lg font-black text-amber-50 dark:bg-red-700 dark:text-white print:border print:border-black print:bg-transparent print:text-black">{n.digit}</span>
              <MorseCode code={n.morse} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">📻 Procedure signs</h2>
        <div className="mt-2 grid gap-2">
          {MORSE_PROSIGNS.map((p) => (
            <div key={p.sign} className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
              <strong className="min-w-28">{p.sign}</strong>
              <MorseCode code={p.code} />
              <span className="opacity-80">{p.meaning}</span>
            </div>
          ))}
        </div>
      </div>
      {MORSE_NOTES.map((s) => (
        <div key={s.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs opacity-60">ITU Morse reference — practice lamp and whistle timing before you need it for real.</p>
    </div>
  );
}

function buildColregText(): string {  return "COLREG — WORKING NOTES (summaries, not the official text)\n" +
    COLREG_SECTIONS.map((s) => `\n${s.heading.toUpperCase()}\n` + s.points.map((p) => `• ${p}`).join("\n")).join("\n") +
    "\n\n— via Shark";
}

function Colreg() {
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("COLREG working notes", buildColregText())} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
      </div>
      {COLREG_SECTIONS.map((s, i) => (
        <div key={s.heading} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {i + 1}. {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs opacity-60">Study summaries — the official COLREG text (IMO) always governs. Keep a current copy on the bridge.</p>
    </div>
  );
}

type Tab = "orders" | "cards" | "lights" | "symbols" | "weather" | "signals" | "morse" | "colreg";

function DocsInner() {
  const router = useRouter();
  // Tab is read from the URL client-side (effect) so nothing suspends
  // during render — the page hydrates deterministically.
  const [tab, setTabState] = useState<Tab>("orders");
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "cards" || t === "lights" || t === "symbols" || t === "weather" || t === "signals" || t === "morse" || t === "colreg") setTabState(t);
    } catch { /* ignore */ }
  }, []);
  function setTab(t: Tab) {
    setTabState(t);
    router.replace(t === "orders" ? "/documents" : `/documents?tab=${t}`, { scroll: false });
  }
  return (
    <div className="grid gap-4">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">📑 Navigation Documents</h1>
        <p className="text-sm opacity-70">Master Standing Orders + Emergency Check Cards. Share or print for the bridge folder.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950 print:hidden">
        <button onClick={() => setTab("orders")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "orders" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>📜 Orders</button>
        <button onClick={() => setTab("cards")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "cards" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>🆘 Cards ({EMERGENCY_CARDS.length})</button>
        <button onClick={() => setTab("lights")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "lights" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>💡 Buoys</button>
        <button onClick={() => setTab("symbols")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "symbols" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>🧭 Symbols</button>
        <button onClick={() => setTab("weather")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "weather" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>⛅ Weather</button>
        <button onClick={() => setTab("signals")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "signals" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>🚩 Signals</button>
        <button onClick={() => setTab("morse")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "morse" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>📻 Morse</button>
        <button onClick={() => setTab("colreg")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "colreg" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>⚖️ COLREG</button>
      </div>
      {tab === "orders" ? <Orders /> : tab === "cards" ? <Cards /> : tab === "lights" ? <LightsBuoys /> : tab === "symbols" ? <ChartSymbols /> : tab === "signals" ? <Signals /> : tab === "morse" ? <Morse /> : tab === "colreg" ? <Colreg /> : <WeatherSea />}
    </div>
  );
}

export default function DocumentsPage() {
  return <DocsInner />;
}
