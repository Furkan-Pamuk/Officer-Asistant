// SMS (Bridge / Chief / Engine) documents -> JobChecklistTemplate[] generator.
// Usage: node web/scripts/gen-sms-checklists.mjs [inputDir] [outputFile]
// Input: cleaned .txt dumps (one per source document). English only:
// Turkish lines are dropped. Filled form values (MPX / Pilot Card) are
// dropped — only blank field labels become "Complete: ..." items.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const inDir = process.argv[2] ?? path.join(os.tmpdir(), "opencode", "docdump");
const outFile = process.argv[3] ?? path.join(here, "..", "src", "lib", "sms-checklists.ts");

const TR_CHARS = /[ğüşöçıİ]/;
const TR_WORDS = /\b(ve|için|ile|tarafından|olarak|bölümü?|gemiy?[ea]?|tesisi?|sonra|önce|tamamlandıktan|alınacak|yapılacak|edilecek|gerekl[iı]|aşaması\w*|kontroller?\w*|kontrolü\w*|yapılması|edilmesi|verildi|gözetilir|haberdar|değiştirildi|kabul edildi|anlaşma|mühendis|daimi|talimat|makine|odasına?|jurnal|vardiya|insansız|insanlı|periyot|önlem|düzeltici|eylem|devam edebilir|gerekli|görülürse|sorumluluğ\w*|değişikliği|teklifi|arasında|anlaşılacak|halinde|durumunda|acil|tarih|imza|bölüm|kısım)\b/i;

const DROP_UNIVERSAL = new Set([
  "yes", "status", "remarks", "remark", "item", "check", "details", "detail",
  "agreement", "agreements", "tanker", "terminal", "initials",
  "tanker status", "terminal status", "tanker initials", "terminal initials",
]);
const DROP_ACTION = new Set([
  "no", "n/a", "na", "x", "time", "date", "actions", "position", "signature",
  "name", "rank", "master", "oow", "c/o", "c/e", "table", "sheet", "sheet1",
  "page", "declaration", "part 5", "tanker terminal", "xx", "no.", "item no",
  "ref", "s.", "p.", "m.", "a.", "b.", "c.", "d.", "e.", "f.", "g.", "i.",
  "ii.", "iii.", "iv.", "ship",
]);
const HEADER_WORDS = new Set([
  ...DROP_UNIVERSAL, ...DROP_ACTION, "tanker", "terminal", "chief", "officer", "eng", "no", "voy", "port", "sheet", "sheets",
]);
const DROP_STARTS = [
  "we the undersigned", "we have also agreed", "if, to our knowledge",
  "in accordance with chapter", "we have satisfied", "see also part",
  "to be posted in", "upon completion to be posted", "interval time:", "safety management manual",
  "issue no", "issue date", "revision no", "revision date",
];

function isTurkish(s) {
  return TR_CHARS.test(s) || TR_WORDS.test(s);
}
function normTitle(s) {
  return s.toLowerCase().replace(/[-–—:;.,()"'“”‘’]/g, "").replace(/\s+/g, "");
}
function slugify(s) {
  const tr = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s.toLowerCase().replace(/[çğıöşüİ]/g, (c) => tr[c] ?? "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "doc";
}

function parseFileName(fn) {
  // returns { code: "N"|"E"|"CBO", title, group, department, kind, formDoc }
  let base = fn.replace(/\.txt$/i, "");
  base = base.replace(/^(Bridge_|Chief_|Engine_|DOC_|XLS_)/i, "");
  base = base.replace(/_20\.10\.2026$/, "").replace(/[-_\s]+$/, "").replace(/\s+/g, " ").trim();
  base = base.replace(/\bOZEL\b/g, "(Company)");
  let code = "CBO";
  if (/^N\s?0|^N\s?1[0-9]|^N\s/.test(base) || /^N\d/.test(base)) code = "N";
  else if (/^E\s?\d/.test(base) || /^E\d/.test(base)) code = "E";
  const group = code === "N" ? "bridge" : code === "E" ? "engine" : "cargo";
  const department = code === "E" ? "engine" : "deck";
  const up = base.toUpperCase();
  let kind = "checklist";
  if (up.includes("MPX") || up.includes("PILOT")) kind = "form";
  else if (up.includes("SCHEDULE")) kind = "schedule";
  else if (up.includes("DATASHEET")) kind = "datasheet";
  else if (up.includes("LOG")) kind = "log";
  else if (up.includes("RECORD")) kind = "record";
  else if (up.includes("PLAN")) kind = "plan";
  else if (up.includes("REPORT")) kind = "report";
  else if (up.includes("ORDER")) kind = "orders";
  else if (up.includes("NOTICE")) kind = "notice";
  else if (up.includes("HISTORY")) kind = "record";
  const fieldKind = ["log", "record", "plan", "report", "schedule", "datasheet", "form"].includes(kind);
  return { code, title: base, group, department, kind, fieldKind, formDoc: kind === "form" };
}

function processSegment(seg, ctx) {
  // ctx: { tag, formDoc, fieldKind }
  let s = seg.trim().replace(/\s+/g, " ");
  if (!s || s.length < 2) return null;
  s = s.replace(/_Toc\d+|_Hlk\d+|_GoBack/g, "").trim().replace(/\s+/g, " ");
  if (!s || s.length < 2) return null;
  // checkbox / field-name residue, often glued without spaces ("Check1Check1 YES")
  s = s.replace(/(Check\d+|Text\d+|FORMTEXT|FORMCHECKBOX)/gi, "").trim().replace(/\s+/g, " ");
  if (!s || s.length < 2) return null;
  if (/^(yes\s*\/\s*no|no\s*\/\s*yes)$/i.test(s)) return null;
  if (isTurkish(s)) { ctx.tr++; return null; }
  const low = s.toLowerCase();
  if (DROP_UNIVERSAL.has(low)) return null;
  if (!ctx.fieldKind && !ctx.formDoc && DROP_ACTION.has(low)) return null;
  if (/^[\d\s.,/:%\-–—+()°]+$/.test(s)) return null; // pure numbers/punct
  if (/^(dd\/mm\/yyyy|dd\.mm\.yyyy)$/.test(low)) return null;
  if (/^:\s*\S+/.test(s)) return null; // orphan values (": 02")
  if (/^\?{2,}/.test(s)) return null;
  if (DROP_STARTS.some((p) => low.startsWith(p))) return null;
  // header-chrome lines ("SHIP: VOY No.: ...", "PORT OF DEPARTURE: ...")
  if (/^(ship|voy(age)?(\s+no\.?)?|date(\s*\/\s*time)?|port of [a-z]+|oow|master|chief|c\/o|c\/e)\b[^:]{0,40}:/i.test(s) && !ctx.formDoc) return null;
  // every word is a header word -> table chrome ("Time Time Time", "Tanker Terminal");
  // single header words survive in fieldKind docs ("Complete: Date")
  const words = low.replace(/[.,:;()]/g, "").split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => HEADER_WORDS.has(w))) return null;
  // standalone role / signature lines
  if (/^(oow|c\/o|c\/e|master|chief officer|chief eng(ineer)?|terminal|tanker)(\s+(oow|c\/o|c\/e|master|chief|officer|eng(ineer)?|terminal|tanker))*$/i.test(s)) return null;
  // section headers
  let m = s.match(/^Part (\S+?)[.\s:?]+(.+)$/);
  if (m && m[2].length > 2) { ctx.tag = m[1].replace(/[.:(].*$/, ""); return null; }
  m = s.match(/^([A-Z])\. ([A-Z][A-Z' .&()-]{3,})$/);
  if (m && !ctx.formDoc) { ctx.tag = m[1]; return null; }
  if (m && ctx.formDoc) { ctx.tag = m[1]; return null; }
  if (/^(CHECKS [A-Z -]+|PROCEDURE .*|Procedure .*)$/.test(s)) return null;
  if (/^(CAUTION|WARNING|NOTE|NOTES)$/i.test(s)) return null;
  if (/^-- \d+ of \d+ --$/.test(s)) return null; // page markers ("-- 1 of 4 --")
  if (/^(SAFETY MANAGEMENT MANUAL|Chapter [\d.]+)$/i.test(s)) return null;
  if (/^\d{2}-\d{2}$/.test(s)) return null;

  const prefix = ctx.tag && ctx.tag.length <= 4 ? `[${ctx.tag}] ` : "";

  if (ctx.formDoc) {
    // blank-field labels only — filled values never enter the app
    const ci = s.indexOf(":");
    if (ci <= 0) return null;
    let label = s.slice(0, ci).trim().replace(/\s+/g, " ").replace(/^[A-Z]\.\s*/, "");
    if (!label || label.length < 2 || /sign/i.test(label)) return null;
    const item = `${prefix}Complete: ${label}`;
    return item.length >= 4 ? item : null;
  }

  // strip role prefixes ("OOW: ", "C/O: ", "OOEW: ")
  s = s.replace(/^[A-Z][A-Z/.]{1,6}:\s+/, "");
  // strip list markers (up to 2 passes): "(1) ", "1. ", "a. ", "i. ", "- ", "* ",
  // "o " and Wingdings bullets (U+F0A7, safe ASCII escape)
  for (let k = 0; k < 2; k++) {
    const ns = s.replace(/^(\(\d{1,3}\)\s*|\d{1,3}[.)]\s+|[a-z]\.\s+|[ivxlcdm]+\.\s+|[-*•–—]\s+|o\s+|\uF0A7\s+)/, "");
    if (ns === s) break;
    s = ns.trim();
  }
  if (!s || s.length < 3) return null;
  if (isTurkish(s)) { ctx.tr++; return null; }
  const low2 = s.toLowerCase();
  if (DROP_UNIVERSAL.has(low2)) return null;
  if (!ctx.fieldKind && !ctx.formDoc && DROP_ACTION.has(low2)) return null;
  if (/^[\d\s.,/:%\-–—+()°]+$/.test(s)) return null;
  // ALL-CAPS short headers are not items (kept as fields in log/record docs)
  if (!ctx.fieldKind && !ctx.formDoc && s === s.toUpperCase() && s.length < 28 && !/[a-z]/.test(s)) return null;
  // ALL-CAPS headers ending with a colon are section prompts, not items
  if (!ctx.fieldKind && !ctx.formDoc && /^[A-Z0-9][A-Z0-9' .&()/,-]*:$/.test(s)) return null;

  let item = prefix + s;
  if (/^(caution|warning)\b/i.test(s)) item = prefix + "⚠ " + s;
  if (/^(dd\/mm\/yyyy|dd\.mm\.yyyy)$/.test(low2)) return null;

  if (ctx.fieldKind) {
    // log/record/plan/schedule/datasheet: full sentences as-is, short labels as fields
    const sentence = (/[.?!…]$/.test(s) && s.length > 8) || s.length > 50;
    if (!sentence) item = `${prefix}Complete: ${s.replace(/[.:;]+$/, "")}`;
  }
  return item;
}

function convertFile(fp) {
  const meta = parseFileName(path.basename(fp));
  const raw = fs.readFileSync(fp, "utf8").split("\n");
  const ctx = { tag: "", formDoc: meta.formDoc, fieldKind: meta.fieldKind, tr: 0 };
  const items = [];
  const seen = new Set();
  const titleNorm = normTitle(meta.title);
  const joinable = !meta.fieldKind && !meta.formDoc; // action docs: join continuations
  for (const line of raw) {
    const t = line.trim();
    if (!t) continue;
    if (normTitle(t) === titleNorm) continue; // doc title echo
    for (const seg of t.split(/\s*\|\s*/)) {
      const item = processSegment(seg, ctx);
      if (item && !seen.has(item)) {
        const prev = items.length ? items[items.length - 1] : "";
        const tagOf = (x) => (x.match(/^\[([^\]]+)\] /) || [])[1] ?? "";
        const myTag = tagOf(item);
        if (
          joinable && prev && /^[a-z]/.test(item) && !/^e\.g\./.test(item) &&
          !/[.?!:…]$/.test(prev) && (myTag === tagOf(prev)) &&
          (prev.length + item.length < 400)
        ) {
          // continuation of the previous line ("equipment being used ...")
          seen.delete(prev);
          const joined = prev + " " + item.replace(/^\[[^\]]+\] /, "");
          seen.add(joined);
          items[items.length - 1] = joined;
        } else {
          seen.add(item);
          items.push(item);
        }
      }
    }
  }
  return { meta, items, tr: ctx.tr, lines: raw.length };
}

const files = fs.readdirSync(inDir).filter((f) => f.toLowerCase().endsWith(".txt")).sort();
const templates = [];
const usedSlugs = new Set();
let totalTr = 0;
const report = [];
for (const f of files) {
  const { meta, items, tr, lines } = convertFile(path.join(inDir, f));
  totalTr += tr;
  let slug = "sms-" + slugify(meta.title);
  let n = 2;
  while (usedSlugs.has(slug)) slug = "sms-" + slugify(meta.title) + "-" + n++;
  usedSlugs.add(slug);
  const m = meta.title.match(/^[A-Z]+\s*\d+[A-Z]?/);
  const num = m ? m[0].replace(/\s+/, " ") : meta.code;
  templates.push({
    id: slug,
    title: meta.title,
    description: `${num} • SMS ${meta.kind} • ${items.length} items`,
    department: meta.department,
    group: meta.group,
    items,
    _lines: lines,
  });
  report.push(`${items.length.toString().padStart(4)} it / ${lines.toString().padStart(4)} ln  ${meta.title}`);
}

// sort: bridge (N numeric), cargo (CBO numeric), engine (E numeric)
const gOrder = { bridge: 0, cargo: 1, engine: 2 };
templates.sort((a, b) => {
  if (a.group !== b.group) return gOrder[a.group] - gOrder[b.group];
  const na = parseInt(a.title.match(/\d+/)?.[0] ?? "999", 10);
  const nb = parseInt(b.title.match(/\d+/)?.[0] ?? "999", 10);
  return na - nb || (a.title < b.title ? -1 : 1);
});

const out = templates.map(({ _lines, ...t }) => t);
const ts = `import type { JobChecklistTemplate } from "./types";\n\n// AUTO-GENERATED from the company's SMS library (Bridge / Chief / Engine\n// checklists, logs, records, plans and forms) by web/scripts/gen-sms-checklists.mjs.\n// Do not edit by hand — re-run the generator. Filled form values and\n// Turkish duplicate lines are stripped at generation time.\nexport const SMS_JOB_TEMPLATES: JobChecklistTemplate[] = ${JSON.stringify(out, null, 1)};\n`;
fs.writeFileSync(outFile, ts, "utf8");

const counts = {};
for (const t of templates) counts[t.group] = (counts[t.group] ?? 0) + 1;
console.log(`files: ${files.length}, templates: ${templates.length}, items: ${out.reduce((a, t) => a + t.items.length, 0)}, tr-dropped: ${totalTr}`);
console.log("groups: " + JSON.stringify(counts));
const empty = templates.filter((t) => t.items.length === 0);
console.log("empty: " + (empty.map((t) => t.title).join(" | ") || "none"));
console.log("--- per file ---");
console.log(report.join("\n"));
