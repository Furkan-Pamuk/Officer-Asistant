// Ücretsiz zabitan soru havuzu toplayıcı (Node, bağımlılık yok).
// Kaynak: gemiadamlarisinavi.com — doğru şık = sarı zemin #FFFF66.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)));
const BASE = "https://www.gemiadamlarisinavi.com/testler/Uzakyol_Vardiya_Zabiti";
const RANK = "Uzakyol Vardiya Zabiti";
const PLAN = {
  "Vardiya-Standartlari": ["Vardiya_Standartlari", 8],
  "Seyir": ["Seyir", 5],
  "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 6],
  "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 9],
};

function clean(s) {
  s = s.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, " [Görsel: $1] ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  return s.replace(/\s+/g, " ").trim();
}

function parsePage(page) {
  const parts = page.split(/<font color="#464646"><b>\s*(\d+)\.\s*<\/b>/);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    const no = parseInt(parts[i], 10);
    const content = parts[i + 1] ?? "";
    const mOk = content.match(/<span[^>]*background-color:\s*#FFFF66[^>]*>\s*(\d)\)([\s\S]*?)<\/span>/i);
    const cevap = mOk ? parseInt(mOk[1], 10) : null;
    const mQ = content.match(/^([\s\S]*?)<\/font>([\s\S]*)$/);
    let soru, rest;
    if (mQ) { soru = clean(mQ[1]); rest = mQ[2]; }
    else { soru = clean(content.slice(0, 500)); rest = content; }
    const imgs = [...content.matchAll(/<img[^>]*src="([^"]+)"/gi)].map((m) => m[1]);
    const tmp = content.replace(/<\/?span[^>]*>/gi, " ");
    const siklar = ["", "", "", "", ""];
    for (const m of tmp.matchAll(/(?:^|>|\s)(\d)\)\s*([\s\S]*?)(?=<br>|$)/g)) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 5) siklar[n - 1] = clean(m[2]);
    }
    out.push({ no, soru, gorsel: imgs, siklar, cevap });
  }
  return out;
}

const manifest = { rank: RANK, dersler: {} };
let total = 0;
for (const [dersOut, [dersUrl, adet]] of Object.entries(PLAN)) {
  const ddir = join(root, "Uzakyol-Vardiya-Zabiti", dersOut);
  mkdirSync(ddir, { recursive: true });
  manifest.dersler[dersOut] = { kaynak_ders: dersUrl, denemeler: [] };
  for (let i = 1; i <= adet; i++) {
    const url = `${BASE}/${dersUrl}/Deneme_Sinavi-${i}/`;
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const ph = await r.text();
      const sorular = parsePage(ph);
      total += sorular.length;
      const data = { rank: RANK, ders: dersOut, deneme: i, kaynak_url: url, soru_sayisi: sorular.length, sorular };
      const fn = `deneme-${String(i).padStart(2, "0")}.json`;
      writeFileSync(join(ddir, fn), JSON.stringify(data, null, 1));
      manifest.dersler[dersOut].denemeler.push({ deneme: i, dosya: `Uzakyol-Vardiya-Zabiti/${dersOut}/${fn}`, soru: sorular.length });
      console.log(`OK ${dersOut} ${fn}: ${sorular.length} soru`);
    } catch (e) {
      console.log(`HATA ${dersOut} ${i}: ${String(e).slice(0, 200)}`);
    }
  }
}
manifest.toplam_soru = total;
writeFileSync(join(root, "MANIFEST.json"), JSON.stringify(manifest, null, 1));
console.log("TOPLAM:", total);
