"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EMERGENCY_CARDS, LIGHTS_BUOYS, CHART_SYMBOLS, WEATHER_NOTES, MASTER_STANDING_ORDERS, PHONETIC, PHONETIC_NUMERALS, SIGNAL_NOTES, MORSE_LETTERS, MORSE_PROSIGNS, MORSE_NOTES, type EmergencyCard } from "@/lib/navigation-documents";
import { COLREG_RULES, LIGHT_CONFIGS, MANEUVER_SIGNALS, FOG_PATTERNS } from "@/lib/colreg";
import ColregLights from "@/components/ColregLights";
import SoundSignals from "@/components/SoundSignals";
import { FlagFigure, MorseCode } from "@/components/SignalFlags";
import { CardinalGrid, LateralRow, OtherMarksRow, RhythmList } from "@/components/BuoyDiagrams";
import { BeaufortTable, CloudGallery, FrontSymbols, TwelfthsStrip } from "@/components/WeatherDiagrams";
import { Sym } from "@/components/ChartSymbols";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";

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

async function shareText(title: string, text: string, t: (key: string) => string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    alert(t("doc.copied"));
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
  const { t } = useLocale();
  const o = useContentOverlay();
  useEffect(() => { setSig(loadSig()); }, []);
  function save(next: Sig) {
    setSig(next);
    try { localStorage.setItem(SIG_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  const inp = "rounded-xl border px-3 py-2 text-sm w-full";

  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Master Standing Orders", buildOrdersText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm dark:border-red-950 dark:bg-neutral-950 print:border-black">
        <h2 className="font-black">{t("doc.signBlock")}</h2>
        <p className="mt-1 opacity-70">{t("doc.signHint")}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3 print:hidden">
          <input value={sig.vessel} onChange={(e) => save({ ...sig, vessel: e.target.value })} placeholder={t("doc.vesselPh")} className={inp} />
          <input value={sig.master} onChange={(e) => save({ ...sig, master: e.target.value })} placeholder={t("doc.masterPh")} className={inp} />
          <input type="date" value={sig.date} onChange={(e) => save({ ...sig, date: e.target.value })} className={inp} />
        </div>
        <div className="mt-3 hidden border-t border-amber-200 pt-2 font-bold print:block dark:border-red-950">
          {t("doc.printHead").replace("{v}", sig.vessel || "…………").replace("{m}", sig.master || "…………").replace("{d}", sig.date || "…………")}
        </div>
      </div>
      {MASTER_STANDING_ORDERS.map((g0, gi) => {
        const g = withOv(g0, cov(o, "orders", g0.group));
        return (
        <div key={g0.group} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black">
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
        );
      })}
      <p className="text-xs opacity-60 print:block">{t("doc.smsHint")}</p>
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
  const { t } = useLocale();
  const o = useContentOverlay();
  const cards = EMERGENCY_CARDS.map((c) => withOv(c, cov(o, "emcards", c.id)));
  useEffect(() => { setTicks(loadTicks()); }, []);
  function toggle(key: string) {
    const next = { ...ticks, [key]: !ticks[key] };
    setTicks(next);
    try { localStorage.setItem(TICK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  function resetCard(id: string) {
    const next = { ...ticks };
    cards.find((c) => c.id === id)?.steps.forEach((_, i) => delete next[`${id}:${i}`]);
    setTicks(next);
    try { localStorage.setItem(TICK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <p className="flex-1 text-sm opacity-70">{t("doc.tickHint")}</p>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      {cards.map((c) => {
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
                    <strong>{t("doc.after")}</strong>{c.after.join(" • ")}
                  </div>
                  <div className="px-1 text-xs font-bold opacity-60">📖 {c.reference}</div>
                </div>
                <button onClick={() => resetCard(c.id)} className="mt-2 rounded-full border px-3 py-1 text-xs font-bold print:hidden">{t("doc.resetTicks")}</button>
                <button onClick={() => shareText(`Emergency Card — ${c.title}`, buildCardText(c), t)} className="ml-2 mt-2 rounded-full border bg-white px-3 py-1 text-xs font-bold dark:bg-black print:hidden">{t("doc.shareCard")}</button>
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
  const { t } = useLocale();
  const o = useContentOverlay();
  const secs = LIGHTS_BUOYS.map((s) => ({ key: s.heading, s: withOv(s, cov(o, "docsec", s.heading)) }));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Lights & Buoys — working notes", buildLightsText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      {secs.map(({ key, s }, i) => (
        <div key={key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
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
      <p className="text-xs opacity-60">{t("doc.buoyHint")}</p>
    </div>
  );
}

function buildSymbolsText(): string {
  return "CHART SYMBOLS — PAPER & ECDIS\n" +
    CHART_SYMBOLS.map((g) => `\n${g.heading.toUpperCase()}\n` + g.symbols.map((s) => `• ${s.name}: ${s.meaning}`).join("\n")).join("\n") +
    "\n\nPer INT1 / S-52 conventions — always confirm with current chart & ENCs. — via Shark";
}

function ChartSymbols() {
  const { t } = useLocale();
  const o = useContentOverlay();
  const groups = CHART_SYMBOLS.map((g) => ({
    key: g.heading,
    g: { ...withOv(g, cov(o, "charthead", g.heading)), symbols: g.symbols.map((s) => withOv(s, cov(o, "chartsym", s.id))) },
  }));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Chart symbols — paper & ECDIS", buildSymbolsText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      {groups.map(({ key, g }, i) => (
        <div key={key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
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
      <p className="text-xs opacity-60">{t("doc.symHint")}</p>
    </div>
  );
}

function buildWeatherText(): string {
  return "WEATHER & SEA — WORKING NOTES\n" +
    WEATHER_NOTES.map((s) => `\n${s.heading.toUpperCase()}\n` + s.points.map((p) => `• ${p}`).join("\n")).join("\n") +
    "\n\n— via Shark";
}

function WeatherSea() {
  const { t } = useLocale();
  const o = useContentOverlay();
  const secs = WEATHER_NOTES.map((s) => ({ key: s.heading, s: withOv(s, cov(o, "docsec", s.heading)) }));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Weather & Sea — working notes", buildWeatherText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">{t("doc.wxCloud")}</h2>
        <CloudGallery />
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">{t("doc.wxBft")}</h2>
        <BeaufortTable />
      </div>
      {secs.map(({ key, s }, i) => (
        <div key={key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
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
      <p className="text-xs opacity-60">{t("doc.wxHint")}</p>
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
  const { t } = useLocale();
  const o = useContentOverlay();
  const rows = PHONETIC.map((p) => withOv(p, cov(o, "phonetic", p.letter)));
  const notes = SIGNAL_NOTES.map((s) => ({ key: s.heading, s: withOv(s, cov(o, "docsec", s.heading)) }));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Phonetic alphabet + signal flags", buildSignalsText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((p) => (
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
        <h2 className="font-black">{t("doc.numPenn")}</h2>
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
          <span className="grid justify-items-center gap-1"><FlagFigure code="ANS" size={64} />{t("doc.ansPenn")}</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP1" size={64} />{t("doc.sub1")}</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP2" size={64} />{t("doc.sub2")}</span>
          <span className="grid justify-items-center gap-1"><FlagFigure code="REP3" size={64} />{t("doc.sub3")}</span>
        </div>
      </div>
      {notes.map(({ key, s }) => (
        <div key={key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs opacity-60">{t("doc.flagHint")}</p>
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
  const { t } = useLocale();
  const o = useContentOverlay();
  const prosigns = MORSE_PROSIGNS.map((p) => withOv(p, cov(o, "prosigns", p.sign)));
  const notes = MORSE_NOTES.map((s) => ({ key: s.heading, s: withOv(s, cov(o, "docsec", s.heading)) }));
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("Morse code", buildMorseText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
        <h2 className="font-black">{t("doc.letters")}</h2>
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
        <h2 className="font-black">{t("doc.numerals")}</h2>
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
        <h2 className="font-black">{t("doc.procSigns")}</h2>
        <div className="mt-2 grid gap-2">
          {prosigns.map((p) => (
            <div key={p.sign} className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50/60 px-3 py-2 text-sm dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">
              <strong className="min-w-28">{p.sign}</strong>
              <MorseCode code={p.code} />
              <span className="opacity-80">{p.meaning}</span>
            </div>
          ))}
        </div>
      </div>
      {notes.map(({ key, s }) => (
        <div key={key} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
          <h2 className="font-black">{s.icon} {s.heading}</h2>
          <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
            {s.points.map((p, j) => (
              <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-xs opacity-60">{t("doc.morseHint")}</p>
    </div>
  );
}

function buildColregText(): string {
  const rules = COLREG_RULES.map((r) => `\nRULE ${r.n} — ${r.t}\n` + r.pts.map((p) => `• ${p}`).join("\n")).join("\n");
  const lights = "\nLIGHTS\n" + LIGHT_CONFIGS.map((c) => `• ${c.name}: ${c.note}`).join("\n");
  const sounds = "\nSOUND\n" + MANEUVER_SIGNALS.map((m) => `• ${m.s} = ${m.m}`).join("\n") +
    "\nFOG (≤2 min)\n" + FOG_PATTERNS.map((f) => `• ${f.v}: ${f.seq.join(" ")}${f.note ? ` (${f.note})` : ""}`).join("\n");
  return "COLREG — COMPLETE STUDY REFERENCE (summaries, not the official text)\n" + rules + "\n" + lights + "\n" + sounds + "\n\n— via Shark";
}

type ColregTab = "rules" | "lights" | "sounds";

function Colreg() {
  const [sec, setSec] = useState<ColregTab>("rules");
  const { t } = useLocale();
  const o = useContentOverlay();
  const ovRules = COLREG_RULES.map((r) => withOv(r, cov(o, "rules", r.n)));
  const sbtn = (t: ColregTab, label: string) =>
    `rounded-full px-3 py-1.5 text-sm font-bold ${sec === t ? "bg-slate-900 text-amber-50 dark:bg-red-700 dark:text-white" : "border opacity-70 hover:opacity-100"}`;
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => shareText("COLREG complete reference", buildColregText(), t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 {t("common.share")}</button>
        <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ {t("common.print")}</button>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950 print:hidden">
        <button onClick={() => setSec("rules")} className={sbtn("rules", `📖 Rules (${COLREG_RULES.length})`)}>{t("doc.rulesN").replace("{n}", String(COLREG_RULES.length))}</button>
        <button onClick={() => setSec("lights")} className={sbtn("lights", `💡 Lights (${LIGHT_CONFIGS.length})`)}>{t("doc.lightsN").replace("{n}", String(LIGHT_CONFIGS.length))}</button>
        <button onClick={() => setSec("sounds")} className={sbtn("sounds", "📯 Sounds")}>{t("doc.sounds")}</button>
      </div>
      {sec === "rules" ? (
        ovRules.map((r) => (
          <div key={r.n} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:border-black print:break-inside-avoid">
            <h2 className="font-black">{t("doc.ruleN").replace("{n}", String(r.n)).replace("{t}", r.t)}</h2>
            <ul className="mt-2 grid gap-2 text-sm leading-relaxed">
              {r.pts.map((p, j) => (
                <li key={j} className="rounded-xl bg-amber-50/60 px-3 py-2 dark:bg-black dark:ring-1 dark:ring-red-950 print:bg-transparent print:ring-0">• {p}</li>
              ))}
            </ul>
          </div>
        ))
      ) : sec === "lights" ? (
        <ColregLights />
      ) : (
        <SoundSignals />
      )}
      <p className="text-xs opacity-60">{t("doc.colregHint")}</p>
    </div>
  );
}

type Tab = "orders" | "cards" | "lights" | "symbols" | "weather" | "signals" | "morse" | "colreg";

function DocsInner() {
  useDocTitle("doc.title");
  const router = useRouter();
  // Tab is read from the URL client-side (effect) so nothing suspends
  // during render — the page hydrates deterministically.
  const [tab, setTabState] = useState<Tab>("orders");
  const { t } = useLocale();
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
        <h1 className="text-2xl font-bold">{t("doc.title")}</h1>
        <p className="text-sm opacity-70">{t("doc.sub")}</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950 print:hidden">
        <button onClick={() => setTab("orders")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "orders" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabOrders")}</button>
        <button onClick={() => setTab("cards")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "cards" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabCards").replace("{n}", String(EMERGENCY_CARDS.length))}</button>
        <button onClick={() => setTab("lights")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "lights" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabBuoys")}</button>
        <button onClick={() => setTab("symbols")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "symbols" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabSymbols")}</button>
        <button onClick={() => setTab("weather")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "weather" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabWeather")}</button>
        <button onClick={() => setTab("signals")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "signals" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabSignals")}</button>
        <button onClick={() => setTab("morse")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "morse" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabMorse")}</button>
        <button onClick={() => setTab("colreg")} className={`min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === "colreg" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("doc.tabColreg")}</button>
      </div>
      {tab === "orders" ? <Orders /> : tab === "cards" ? <Cards /> : tab === "lights" ? <LightsBuoys /> : tab === "symbols" ? <ChartSymbols /> : tab === "signals" ? <Signals /> : tab === "morse" ? <Morse /> : tab === "colreg" ? <Colreg /> : <WeatherSea />}
    </div>
  );
}

export default function DocumentsPage() {
  useDocTitle("doc.title");
  return <DocsInner />;
}
