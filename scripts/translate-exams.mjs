// TR -> EN batch translator for exam questions (Google free endpoint).
// Usage: node web/scripts/translate-exams.mjs
// Resume-safe: cache file updated after every batch.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const havuz = "C:\\Users\\furka\\Desktop\\Projects\\Officer Asistant\\SoruHavuzu";
const outDir = path.join(here, "..", "src", "lib", "exam-data", "en");
const cacheFile = "C:\\Users\\furka\\AppData\\Local\\Temp\\opencode\\exam-en-cache.json";
const failedFile = "C:\\Users\\furka\\AppData\\Local\\Temp\\opencode\\exam-en-failed.txt";

const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
let calls = 0;

async function cevirTek(text) {
  const usp = new URLSearchParams({ client: "gtx", sl: "tr", tl: "en", dt: "t" });
  usp.append("q", text);
  for (let deneme = 0; deneme < 5; deneme++) {
    try {
      calls++;
      const r = await fetch("https://translate.googleapis.com/translate_a/single?" + usp.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const out = (j[0] || []).map((x) => x[0]).join("").trim();
      if (!out) throw new Error("bos-yanit");
      return out;
    } catch (e) {
      const bekle = e.message.startsWith("HTTP 429") ? 20000 * (deneme + 1) : 5000 * (deneme + 1);
      await new Promise((r2) => setTimeout(r2, bekle));
      if (deneme === 4) throw new Error("5 denemede basarisiz: " + text.slice(0, 60));
    }
  }
  throw new Error("erisilemedi");
}

// Zaten İngilizce olan segmentleri çevirmeden aynen geçir (Denizcilik
// İngilizcesi dersleri + EN kısaltmalar). TR tespiti: TR harfi veya TR stopword.
const TR_LETTER = /[ğüşöçıİĞÜŞÖÇı]/;
const TR_STOP = /\b(ve|veya|ile|gibi|kadar|hangi|hangisi|hangisinde|nedir|nelerdir|kaç|neden|nasıl|değil|değildir|olarak|olmalıdır|olmalı|yapılır|edilir|bulunur|vardır|olur|aşağıdaki|aşağıdakilerden|yukarıdaki|göre|sonra|önce|tüm|ya|ise|iken|olan|olup|olduğu|olması|olduğunu|edilecek|yapılacak|olacak|gereken|hepsi|yok|var|eder|eden|mi|mı|mu|mü|midir|mıdır|mudur|müdür|kimdir|kim|nerede|nereye|nereden|ne|akdeniz|karadeniz|kazan\w*|devlet|denet\w*|kurul\w*|yerel|ulusal|yerli|tehlike\w*|yolcu|kamarot|tayfa|fesih\w*|ihbar|donatan\w*|bilgi|vermek|verir|tenzil\w*|muafiyet|temiz|patenta|ticari|faaliyet\w*|bulun\w*|temsilci\w*|haber|ay|derece|sorumluluk|sefer\w*|durum\w*|unsur\w*|motor(u|lar|un|a|da|de)\b|malik\w*|talep\w*|tamir\w*|kabul|hale|metre|gem\w*|deniz\w*|makine\w*|yangın\w*|yangin\w*|kaptan\w*|zabit\w*|liman\w*|tekne\w*|personel\w*|yük\w*|yuk\w*)\b/i;
const isTurkishSeg = (s) => TR_LETTER.test(s) || TR_STOP.test(s);

// unique segments (stems + options), skipping numbers/punct-only and "—"
const NUMRE = /^[\d\s.,/:%\-–—+()°]+$/;
const segSet = new Map(); // text -> null (untranslated)
function w(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = d + "/" + f.name;
    if (f.isDirectory()) { w(p); continue; }
    if (!f.name.endsWith(".json") || f.name.startsWith("MANIFEST")) continue;
    const j = JSON.parse(fs.readFileSync(p, "utf8"));
    for (const s of (Array.isArray(j) ? j : j.sorular)) {
      const stem = String(s.soru ?? "").trim();
      if (!stem) continue;
      if (!segSet.has(stem)) segSet.set(stem, null);
      for (let i = 0; i < 5; i++) {
        const o = String(s.siklar[i] ?? "").trim();
        if (!o || o === "—" || NUMRE.test(o)) continue;
        if (!segSet.has(o)) segSet.set(o, null);
      }
    }
  }
}
w(havuz);
const keys = [...segSet.keys()];
const todo = keys.filter((k) => cache[k] == null);
console.log(`benzersiz segment: ${keys.length}, cacheli: ${keys.length - todo.length}, cevrilecek: ${todo.length}`);

// concurrent workers with stagger
const PAR = 4;
let idx = 0, done = 0, hata = 0, atlanan = 0;
async function isci(ms) {
  await new Promise((r) => setTimeout(r, ms));
  while (true) {
    const i = idx++;
    if (i >= todo.length) return;
    const t = todo[i];
    try {
      if (!isTurkishSeg(t)) {
        cache[t] = t; // already English — pass through
        atlanan++;
      } else {
        cache[t] = await cevirTek(t);
      }
    } catch (e) {
      hata++;
      console.log(`HATA (${hata}): ${e.message}`);
      // kalıcı hata: Türkçe metni aynen bırak, listele, devam et
      cache[t] = t;
      try { fs.appendFileSync(failedFile, t + "\n", "utf8"); } catch { /* ignore */ }
    }
    done++;
    if (done % 50 === 0 || done === todo.length) {
      fs.writeFileSync(cacheFile, JSON.stringify(cache), "utf8");
      console.log(`ilerleme: ${done}/${todo.length} (istek: ${calls}, hata: ${hata}, en-gecis: ${atlanan})`);
    }
    await new Promise((r) => setTimeout(r, 700));
  }
}
await Promise.all([0, 1, 2, 3].map((k) => isci(k * 600)));
fs.writeFileSync(cacheFile, JSON.stringify(cache), "utf8");

const T = (s) => {
  const t = String(s ?? "").trim();
  if (!t || t === "—" || NUMRE.test(t)) return t;
  const c = cache[t];
  if (c == null) throw new Error("cache eksik segment: " + t.slice(0, 60));
  return c;
};

// emit per-rank EN modules mirroring TR structure
fs.mkdirSync(outDir, { recursive: true });
const trMap = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };
const slugify = (s) => s.toLowerCase().replace(/[çğıöşüİÇĞÖŞÜ]/g, (c) => trMap[c] ?? "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
for (const rankDir of fs.readdirSync(havuz, { withFileTypes: true })) {
  if (!rankDir.isDirectory()) continue;
  const slug = slugify(rankDir.name);
  const denemeler = [];
  for (const dersDir of fs.readdirSync(path.join(havuz, rankDir.name), { withFileTypes: true })) {
    if (!dersDir.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(havuz, rankDir.name, dersDir.name))) {
      const m = f.match(/^deneme-(\d+)\.json$/);
      if (!m) continue;
      const j = JSON.parse(fs.readFileSync(path.join(havuz, rankDir.name, dersDir.name, f), "utf8"));
      const sorular = [];
      for (const s of (Array.isArray(j) ? j : j.sorular)) {
        const stem = String(s.soru ?? "").trim();
        if (!stem) continue;
        const opts = [0, 1, 2, 3, 4].map((i) => String(s.siklar[i] ?? "").trim() || "—");
        sorular.push({ no: s.no, soru_en: T(stem), siklar_en: opts.map((o) => T(o)) });
      }
      sorular.sort((a, b) => a.no - b.no);
      denemeler.push({ ders: dersDir.name.replace(/-/g, " "), deneme: Number(m[1]), sorular });
    }
  }
  denemeler.sort((a, b) => (a.ders < b.ders ? -1 : a.ders > b.ders ? 1 : a.deneme - b.deneme));
  fs.writeFileSync(path.join(outDir, `${slug}.ts`),
    `// AUTO-GENERATED machine translation (TR->EN) by web/scripts/translate-exams.mjs. Do not edit.\n` +
    `export interface EnSoru { no: number; soru_en: string; siklar_en: string[] }\n` +
    `export interface EnDeneme { ders: string; deneme: number; sorular: EnSoru[] }\n` +
    `export const DENEMELER_EN: EnDeneme[] = ${JSON.stringify(denemeler)};\n`, "utf8");
  console.log(slug + ": " + denemeler.length + " deneme");
}
console.log("TAMAM");
