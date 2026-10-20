"use client";
import { useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { PORTS, searchPorts, STANDARD_CHANNELS, VHF_DEFAULTS, type Port } from "@/lib/ports";

// Port directory: searchable UN/LOCODE list. VHF working channels differ
// per terminal and change often — enter them from ALRS/NP; they are saved
// per port on this device. Tide tables need harmonic predictions (no free
// global offline source): record the day's tide times from official tables
// in the note field. Load-line zones follow ILLC Annex II — verify against
// the official chart; the quick hint below is a rough guide only.
export default function PortsPage() {
  const [q, setQ] = useState("");
  const [onlyPresets, setOnlyPresets] = useState(false);
  const [sel, setSel] = useState<Port | null>(null);
  const [isPreset, setIsPreset] = useState(false);
  const [form, setForm] = useState({ vts: "", pilot: "", harbour: "", portControl: "", tideNote: "" });
  const saved = useLiveQuery(() => db.portVhf.toArray(), []);
  const presetCount = Object.values(VHF_DEFAULTS).filter((d) => d.vts || d.pilot || d.harbour || d.portControl).length;
  const hasPreset = (code: string) => {
    const d = VHF_DEFAULTS[code];
    return !!d && !!(d.vts || d.pilot || d.harbour || d.portControl);
  };
  const results = searchPorts(q).filter((p) => !onlyPresets || hasPreset(p.code));

  async function open(p: Port) {
    setSel(p);
    const s = await db.portVhf.get(p.code);
    const d = VHF_DEFAULTS[p.code];
    setIsPreset(!s && !!d && !!(d.vts || d.pilot || d.harbour || d.portControl));
    setForm({
      vts: s?.vts ?? d?.vts ?? "",
      pilot: s?.pilot ?? d?.pilot ?? "",
      harbour: s?.harbour ?? d?.harbour ?? "",
      portControl: s?.portControl ?? d?.portControl ?? "",
      tideNote: s?.tideNote ?? "",
    });
  }

  async function save() {
    if (!sel) return;
    await db.portVhf.put({ portCode: sel.code, ...form, updatedAt: new Date().toISOString() });
    alert(`VHF directory saved for ${sel.name}.`);
  }

  const box = "rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950";

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">⚓ Port Info</h1>
        <p className="text-sm opacity-70">Major world ports with UN/LOCODEs. Tap a port for its VHF directory, tide notes and load-line hint.</p>
        <p className="mt-1 text-xs font-bold opacity-60">📻 {presetCount}/{PORTS.length} ports have verified VHF presets — the rest need ALRS entry.</p>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search port, country or UN/LOCODE… (min 2 letters)" className="rounded-2xl border px-4 py-2.5 font-bold" />
      <label className="flex w-fit items-center gap-2 text-sm font-bold print:hidden">
        <input type="checkbox" checked={onlyPresets} onChange={(e) => setOnlyPresets(e.target.checked)} className="h-4 w-4" />
        📻 Only ports with VHF presets
      </label>
      {q.trim().length >= 2 && (
        <div className="grid gap-1">
          {results.map((p) => (
            <button key={p.code} onClick={() => open(p)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${sel?.code === p.code ? "border-stone-900 ring-2 ring-amber-400 dark:border-red-500" : "border-amber-200 dark:border-red-950"}`}>
              <span className="rounded bg-stone-900 px-1.5 py-0.5 font-mono text-[11px] text-amber-50 dark:bg-red-700">{p.code}</span>
              <strong className="flex-1">{p.name} {hasPreset(p.code) && <span title="Verified VHF preset">📻</span>}</strong>
              <span className="opacity-60">{p.country}</span>
            </button>
          ))}
          {results.length === 0 && <p className="text-sm opacity-60">No match in the bundled list — try the full UN/LOCODE site.</p>}
        </div>
      )}
      {sel && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className={box}>
            <h2 className="font-black">{sel.name} <span className="font-mono text-xs opacity-60">{sel.code}</span></h2>
            <p className="text-sm opacity-70">{sel.country} • {sel.lat.toFixed(2)}, {sel.lon.toFixed(2)}</p>
            {isPreset && <p className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold dark:bg-red-950">Preset — verify with ALRS Vol 6 before calling</p>}
            <div className="mt-2 grid gap-2 text-sm">
              {(["vts", "pilot", "harbour", "portControl"] as const).map((k) => (
                <label key={k} className="flex items-center gap-2">
                  <span className="w-28 font-bold">{k === "vts" ? "VTS" : k === "pilot" ? "Pilot" : k === "harbour" ? "Harbour master" : "Port control"}</span>
                  <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder="Ch —" className="flex-1 rounded-xl border px-2 py-1.5" />
                </label>
              ))}
              <button onClick={save} className="rounded-full bg-stone-900 px-4 py-2 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Save VHF directory</button>
              <p className="text-xs opacity-60">Saved on this device ({(saved ?? []).length} ports stored).</p>
            </div>
          </div>
          <div className={box}>
            <h2 className="font-black">📻 Standard channels (ITU, worldwide)</h2>
            <ul className="mt-2 grid gap-1.5 text-sm">
              {STANDARD_CHANNELS.map((c) => (
                <li key={c.ch} className="flex gap-2 rounded-xl bg-amber-50/60 px-3 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
                  <strong className="shrink-0">{c.ch}</strong>
                  <span className="opacity-80">{c.use}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={box}>
            <h2 className="font-black">🌊 Tides & load lines</h2>
            <textarea value={form.tideNote} onChange={(e) => setForm({ ...form, tideNote: e.target.value })} rows={3} placeholder="Today's HW/LW times + heights from official tables…" className="mt-2 w-full rounded-xl border px-2 py-1.5 text-sm" />
            <button onClick={save} className="mt-1 rounded-full border px-3 py-1 text-xs font-bold">Save tide note</button>
            <p className="mt-2 text-xs opacity-70">
              Live worldwide tide predictions need a licensed harmonic service — copy the day's table from official
              sources into the note. Load-line zones/periods follow ILLC Annex II (Tropical / Seasonal / Summer / Winter):
              verify the applicable zone on the official chart for your date — do not navigate on this hint alone.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
