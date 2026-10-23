// EN -> TR batch translator for content data (checklists, cards, cargo,
// documents, recipes, news...). Emits src/lib/locales/content-tr.ts overlay.
// Usage: node web/scripts/translate-content.mjs
// Resume-safe: cache file updated every 50 segments. Re-run any time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// Target locale: MT_TL=es|zh-CN|ru|id|fil (default tr). Cache + output per locale.
const TL = process.env.MT_TL || "tr";
const TAG = TL.replace(/-.*/, "").toUpperCase();
const outFile = path.join(here, "..", "src", "lib", "locales", `content-${TAG.toLowerCase()}.ts`);
const cacheFile = `C:\\Users\\furka\\AppData\\Local\\Temp\\opencode\\content-${TAG.toLowerCase()}-cache.json`;
const reviewFile = `C:\\Users\\furka\\AppData\\Local\\Temp\\opencode\\content-${TAG.toLowerCase()}-review.txt`;
// Mirror of src/lib with node-resolvable relative imports (built by
// C:\Users\furka\AppData\Local\Temp\opencode\pdfext\rtcopy2.mjs — re-run it
// before this script so the mirror is fresh).
const RT2B = "C:/Users/furka/AppData/Local/Temp/opencode/rt2b";

// Field spec: "s" = string, "ss" = string[], {keyed:{key,label}} = [{key,label}] arrays.
const SPEC = [
  { mod: "data", name: "INSPECTION_TYPES", out: "inspTypes", id: "id", f: { name: "s", description: "s", source: "s" } },
  { mod: "data", name: "LIBRARY_BOOKS", out: "books", id: "id", f: { title: "s", description: "s" } },
  { mod: "data", name: "SEED_CARDS", out: "cards", id: "id", f: { category: "s", title: "s", checkPoint: "s", howToPrepare: "s", evidence: "s" } },
  { mod: "data", name: "JOB_TEMPLATES", out: "job", id: "id", f: { title: "s", description: "s", items: "ss" } },
  { mod: "sms-checklists", name: "SMS_JOB_TEMPLATES", out: "job", id: "id", f: { title: "s", description: "s", items: "ss" } },
  { mod: "cargo-data", name: "CARGOES", out: "cargo", id: "slug", f: { name: "s", synonyms: "ss", health: "s", segregation: "s", tlv: "s", antidote: "s", colour: "s", odour: "s", odourThreshold: "s", detection: "s", cleanNote: "s", notes: "s" } },
  { mod: "cargo-data", name: "CLEANING_METHODS", out: "cleanMethods", id: "key", f: { title: "s", body: "s" } },
  { mod: "cargo-data", name: "COMPAT_GROUPS", out: "compatGroups", recordValue: true },
  { mod: "cargo-data", name: "CARGO_CATEGORIES", out: "cargoCats", indexValue: true },
  { mod: "gas-data", name: "GASES", out: "gas", id: "slug", f: { name: "s", synonyms: "ss", tlv: "s", health: "s", segregation: "s", detection: "s", carriage: "s", notes: "s" } },
  { mod: "imsbc-data", name: "BULKS", out: "bulk", id: "slug", f: { name: "s", ventilation: "s", moisture: "s", precautions: "ss", note: "s" } },
  { mod: "imsbc-data", name: "BULK_GROUPS", out: "bulkGroups", id: "id", f: { label: "s", desc: "s" } },
  { mod: "navigation-documents", name: "MASTER_STANDING_ORDERS", out: "orders", id: "group", f: { group: "s", orders: "ss" } },
  { mod: "navigation-documents", name: "LIGHTS_BUOYS", out: "docsec", id: "heading", f: { heading: "s", points: "ss" } },
  { mod: "navigation-documents", name: "WEATHER_NOTES", out: "docsec", id: "heading", f: { heading: "s", points: "ss" } },
  { mod: "navigation-documents", name: "SIGNAL_NOTES", out: "docsec", id: "heading", f: { heading: "s", points: "ss" } },
  { mod: "navigation-documents", name: "MORSE_NOTES", out: "docsec", id: "heading", f: { heading: "s", points: "ss" } },
  { mod: "navigation-documents", name: "CHART_SYMBOLS", out: "chartsym", idOf: "symbols", symId: "id", f: { name: "s", meaning: "s" } },
  { mod: "navigation-documents", name: "CHART_SYMBOLS", out: "charthead", id: "heading", f: { heading: "s" } },
  { mod: "navigation-documents", name: "BEAUFORT", out: "beaufort", id: "f", f: { name: "s", sea: "s", action: "s" } },
  { mod: "navigation-documents", name: "CLOUDS", out: "clouds", id: "id", f: { name: "s", looks: "s", means: "s" } },
  { mod: "navigation-documents", name: "EMERGENCY_CARDS", out: "emcards", id: "id", f: { title: "s", alarm: "s", steps: "ss", after: "ss" } },
  { mod: "navigation-documents", name: "PHONETIC", out: "phonetic", id: "letter", f: { flag: "s" } },
  { mod: "navigation-documents", name: "MORSE_PROSIGNS", out: "prosigns", id: "sign", f: { meaning: "s" } },
  { mod: "navigation-documents", name: "KNOTS", out: "knots", id: "id", f: { name: "s", uses: "s", warning: "s", steps: "ss" } },
  { mod: "colreg", name: "COLREG_RULES", out: "rules", id: "n", f: { t: "s", pts: "ss" } },
  { mod: "colreg", name: "LIGHT_CONFIGS", out: "lightcfg", id: "id", f: { name: "s", note: "s" } },
  { mod: "colreg", name: "MANEUVER_SIGNALS", out: "maneuver", id: "s", f: { m: "s" } },
  { mod: "colreg", name: "FOG_PATTERNS", out: "fog", id: "v", f: { v: "s", note: "s" } },
  { mod: "colreg", name: "DISTRESS_SIGNALS", out: "distress", indexValue: true },
  { mod: "menu", name: "CUISINES", out: "cuisines", id: "id", f: { label: "s" } },
  { mod: "recipes", name: "RECIPES", out: "recipes", recordArrays: { ingredients: "ss", steps: "ss" } },
  { mod: "news", name: "NEWS", out: "news", id: "id", f: { tag: "s", title: "s", body: "ss" } },
  { mod: "news", name: "SECTIONS", out: "sections", id: "id", f: { label: "s", blurb: "s" } },
  { mod: "portdocs", name: "PORT_DOC_MODULES", out: "portdocs", id: "id", f: { label: "s", hint: "s", fields: { keyed: "label" }, columns: { keyed: "label" } } },
  { mod: "inventory", name: "INVENTORY_LISTS", out: "invLists", id: "id", f: { label: "s", hint: "s" } },
  { mod: "todos", name: "TODO_PRESETS", out: "todos", id: "title", f: { title: "s" } },
  { mod: "todos", name: "DEFAULT_LISTS", out: "todolists", id: "name", f: { name: "s" } },
  { mod: "sar-data", name: "SAR_CENTRES", out: "sar", id: "n", f: { coverage: "s" } },
  { mod: "sar-data", name: "FIRST_AID", out: "firstaid", id: "id", f: { title: "s", points: "ss" } },
  { mod: "flags", name: "FLAG_STATES", out: "flags", id: "code", f: { regime: "s" } },
  { mod: "content", name: "MISSION", out: "site", single: "mission" },
  { mod: "content", name: "VISION", out: "site", single: "vision" },
  { mod: "content", name: "VALUES", out: "site", id: "title", prefix: "value:", f: { title: "s", body: "s" } },
  { mod: "content", name: "FEATURES", out: "site", id: "title", prefix: "feature:", f: { title: "s", body: "s" } },
  { mod: "content", name: "FAQ", out: "site", id: "q", prefix: "faq:", f: { a: "s" } },
];

const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
let calls = 0;

async function cevirTek(text) {
  const usp = new URLSearchParams({ client: "gtx", sl: "en", tl: TL, dt: "t" });
  usp.append("q", text);
  for (let deneme = 0; deneme < 5; deneme++) {
    try {
      calls++;
      const r = await fetch("https://translate.googleapis.com/translate_a/single?" + usp.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const out = (j[0] || []).map((x) => x[0]).join("").trim();
      if (!out) throw new Error("bos-yanit");
      return out;
    } catch (e) {
      const bekle = String(e.message).startsWith("HTTP 429") ? 20000 * (deneme + 1) : 5000 * (deneme + 1);
      await new Promise((r2) => setTimeout(r2, bekle));
      if (deneme === 4) throw new Error("5 denemede basarisiz: " + text.slice(0, 60));
    }
  }
  throw new Error("erisilemedi");
}

const TR_LETTER = /[ğüşöçıİĞÜŞÖÇı]/;
const NUMRE = /^[\d\s.,/:%\-–—+()°]+$/;
// unique segments: cacheKey -> {text}
const segs = new Map();
function addSeg(key, text) {
  const t = String(text ?? "").trim();
  if (!t || t === "—" || NUMRE.test(t)) return;
  if (TR_LETTER.test(t)) { cache[key] ??= t; return; } // already Turkish — pass through
  if (!segs.has(key)) segs.set(key, t);
}

const overlay = {}; // out -> id -> patch (filled after translation)
function ensure(out, id) {
  overlay[out] ??= {};
  overlay[out][String(id)] ??= {};
  return overlay[out][String(id)];
}

for (const spec of SPEC) {
  let mod;
  try {
    mod = await import(`file://${RT2B}/${spec.mod}.ts`);
  } catch (e) { console.log(`MOD ATLAMA ${spec.mod}: ${String(e).split("\n")[0].slice(0, 100)}`); continue; }
  const data = mod[spec.name];
  if (data == null) { console.log(`CONST YOK ${spec.mod}.${spec.name}`); continue; }
  const ck = (id, field, idx) => `${spec.out}::${id}::${field}${idx == null ? "" : `#${idx}`}`;

  if (spec.single) {
    addSeg(ck(spec.single, "v"), data);
    ensure(spec.out, spec.single).v = ck(spec.single, "v");
    continue;
  }
  if (spec.recordValue) {
    for (const [k, v] of Object.entries(data)) { addSeg(ck(k, "value"), v); ensure(spec.out, k).value = ck(k, "value"); }
    continue;
  }
  if (spec.indexValue) {
    data.forEach((v, i) => { addSeg(ck(i, "value"), v); ensure(spec.out, i).value = ck(i, "value"); });
    continue;
  }
  if (spec.recordArrays) {
    for (const [k, rec] of Object.entries(data)) {
      const patch = ensure(spec.out, k);
      for (const [field] of Object.entries(spec.recordArrays)) {
        const arr = rec[field] ?? [];
        patch[field] = arr.map((s, i) => { addSeg(ck(k, field, i), s); return ck(k, field, i); });
      }
    }
    continue;
  }
  const list = Array.isArray(data) ? data : Object.values(data);
  for (const item of list) {
    // nested symbol arrays (CHART_SYMBOLS.symbols)
    if (spec.idOf) {
      for (const sym of item[spec.idOf] ?? []) {
        const patch = ensure(spec.out, sym[spec.symId]);
        for (const [field, kind] of Object.entries(spec.f)) {
          if (kind !== "s" || sym[field] == null) continue;
          addSeg(ck(sym[spec.symId], field), sym[field]);
          patch[field] = ck(sym[spec.symId], field);
        }
      }
      continue;
    }
    const id = spec.prefix ? spec.prefix + item[spec.id] : item[spec.id];
    if (id == null) continue;
    const patch = ensure(spec.out, id);
    for (const [field, kind] of Object.entries(spec.f)) {
      const v = item[field];
      if (v == null) continue;
      if (kind === "s") { addSeg(ck(id, field), v); patch[field] = ck(id, field); }
      else if (kind === "ss" && Array.isArray(v)) {
        patch[field] = v.map((s, i) => { addSeg(ck(id, field, i), s); return ck(id, field, i); });
      } else if (kind && kind.keyed && Array.isArray(v)) {
        patch[field] = v.map((row) => ({ key: row.key, [kind.keyed]: ck(id, `${field}.${row.key}`) }));
        for (const row of v) addSeg(ck(id, `${field}.${row.key}`), row[kind.keyed]);
      }
    }
  }
}

const keys = [...segs.keys()];
const todo = keys.filter((k) => cache[k] == null);
console.log(`benzersiz segment: ${keys.length}, cacheli: ${keys.length - todo.length}, cevrilecek: ${todo.length}`);

const PAR = 4;
let idx = 0, done = 0, hata = 0, consec = 0, stop = false;
async function isci(ms) {
  await new Promise((r) => setTimeout(r, ms));
  while (!stop) {
    const i = idx++;
    if (i >= todo.length) return;
    const k = todo[i];
    try {
      cache[k] = await cevirTek(segs.get(k));
      consec = 0;
    } catch (e) {
      hata++;
      consec++;
      console.log(`HATA (${hata}): ${e.message}`);
      cache[k] = segs.get(k); // fallback: English
      if (consec >= 15) { stop = true; console.log("ARD ARDA 15 HATA — duruluyor (cache kaydedildi)."); }
    }
    done++;
    if (done % 50 === 0 || done === todo.length) {
      fs.writeFileSync(cacheFile, JSON.stringify(cache), "utf8");
      console.log(`ilerleme: ${done}/${todo.length} (istek: ${calls}, hata: ${hata})`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }
}
if (todo.length) await Promise.all([0, 1, 2, 3].map((k) => isci(k * 600)));
fs.writeFileSync(cacheFile, JSON.stringify(cache), "utf8");

// resolve placeholders -> translated text
function res(v) {
  if (typeof v === "string") return cache[v] ?? v;
  if (Array.isArray(v)) return v.map(res);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = typeof x === "string" && x.includes("::") ? (cache[x] ?? x) : res(x);
    return o;
  }
  return v;
}
const out = {};
for (const [m, ids] of Object.entries(overlay)) {
  out[m] = {};
  for (const [id, patch] of Object.entries(ids)) out[m][id] = res(patch);
}
fs.writeFileSync(outFile,
  `// AUTO-GENERATED machine translation (EN->${TL}) by web/scripts/translate-content.mjs. Do not edit.\n` +
  `export const CONTENT_${TAG}: Record<string, Record<string, Record<string, unknown>>> = ${JSON.stringify(out)};\n`, "utf8");
console.log("TAMAM -> " + outFile);

// Glossary lock review: source terms that must survive translation.
// Lists EN segments where a protected term vanished — human spot-check list.
const GLOSSARY = ["MMSI", "IMO", "freefall", "EEBD", "SCBA", "LPG", "LNG", "IMDG", "IBC", "MARPOL", "SOLAS", "STCW", "GMDSS", "ECDIS", "AIS", "VHF", "EPIRB", "SART", "FRC", "fomepizole"];
const review = [];
for (const [k, src] of segs) {
  const tr = cache[k];
  if (typeof tr !== "string") continue;
  for (const g of GLOSSARY) {
    if (src.includes(g) && !tr.toLowerCase().includes(g.toLowerCase().replace(/ $/, ""))) {
      review.push(`${k}\n  EN: ${src.slice(0, 120)}\n  ${TL.toUpperCase()}: ${String(tr).slice(0, 120)}`);
      break;
    }
  }
}
fs.writeFileSync(reviewFile, review.join("\n"), "utf8");
console.log(`sozluk-inceleme: ${review.length} supheli -> ` + reviewFile);
