// EN -> es/zh-CN/ru/tl/id batch translator for UI dictionaries (Google free endpoint).
// Usage: node web/scripts/translate-ui.mjs
// Source of truth: src/lib/locales/ui-en.ts (+ hand-written ui-tr.ts, never touched).
// Resume-safe: cache file updated every 50 segments. Re-run after adding keys.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const locDir = path.join(here, "..", "src", "lib", "locales");
const cacheFile = "C:\\Users\\furka\\AppData\\Local\\Temp\\opencode\\ui-cache.json";

const TARGETS = [
  { tl: "es", file: "ui-es.ts", exp: "UI_ES" },
  { tl: "zh-CN", file: "ui-zh.ts", exp: "UI_ZH" },
  { tl: "ru", file: "ui-ru.ts", exp: "UI_RU" },
  { tl: "tl", file: "ui-fil.ts", exp: "UI_FIL" },
  { tl: "id", file: "ui-id.ts", exp: "UI_ID" },
];

function parseDict(file) {
  const t = fs.readFileSync(path.join(locDir, file), "utf8");
  const out = new Map();
  const re = /"([^"]+)": "((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(t))) out.set(m[1], m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
  return out;
}
const en = parseDict("ui-en.ts");
console.log(`kaynak key: ${en.size}`);

const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
let calls = 0;

async function cevirTek(text, tl) {
  const usp = new URLSearchParams({ client: "gtx", sl: "en", tl, dt: "t" });
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

const todo = [];
for (const { tl } of TARGETS) {
  for (const [k, v] of en) {
    if (/^[\d\s.,/:%\-–—+()°]+$/.test(v)) continue;
    if (cache[`${tl}::${k}`] == null) todo.push({ tl, k, v });
  }
}
if (process.argv.includes("--emit-only")) todo.length = 0;
console.log(`cevrilecek: ${todo.length} (cacheli: ${Object.keys(cache).length})`);

const PAR = 4;
let idx = 0, done = 0, hata = 0, consec = 0, stop = false;
async function isci(ms) {
  await new Promise((r) => setTimeout(r, ms));
  while (!stop) {
    const i = idx++;
    if (i >= todo.length) return;
    const { tl, k, v } = todo[i];
    try {
      cache[`${tl}::${k}`] = await cevirTek(v, tl);
      consec = 0;
    } catch (e) {
      hata++;
      consec++;
      console.log(`HATA (${hata}): ${tl} ${k}: ${e.message}`);
      cache[`${tl}::${k}`] = v; // fallback: English
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

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
for (const { tl, file, exp } of TARGETS) {
  const lines = [...en.keys()].map((k) => `  "${k}": "${esc(cache[`${tl}::${k}`] ?? en.get(k))}",`);
  fs.writeFileSync(path.join(locDir, file),
    `// AUTO-GENERATED machine translation (EN->${tl}) by web/scripts/translate-ui.mjs. Do not edit.\n` +
    `export const ${exp}: Record<string, string> = {\n${lines.join("\n")}\n};\n`, "utf8");
  console.log(file + ": " + en.size + " key");
}
console.log("TAMAM");
