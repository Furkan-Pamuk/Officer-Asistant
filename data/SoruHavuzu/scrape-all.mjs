// Tüm ranklar için ücretsiz soru havuzu toplayıcı (Node, bağımlılık yok).
// Kaynak: gemiadamlarisinavi.com — doğru şık = sarı zemin #FFFF66.
// Not: Ana Makine dersinde statik cevap-anahtarı sayfası yok (sadece test.php),
//      o yüzden makine ranklarında Ana Makine hariç tutuldu (site 910 soruluk
//      interaktif arşiv olduğunu yazıyor, testid ile tek tek çözülüyor).
// Kullanım: node SoruHavuzu/scrape-all.mjs [--only=Uzakyol-I-Zabiti,Vardiya-Zabiti]
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)));
const SITE = "https://www.gemiadamlarisinavi.com/testler";

const RANKS = {
  "Uzakyol-Vardiya-Zabiti": ["Uzakyol_Vardiya_Zabiti", {
    "Vardiya-Standartlari": ["Vardiya_Standartlari", 8],
    "Seyir": ["Seyir", 5],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 6],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 9],
  }],
  "Uzakyol-I-Zabiti": ["Uzakyol_I_Zabiti", {
    "Vardiya-Standartlari": ["Vardiya_Standartlari", 8],
    "Seyir": ["Seyir", 5],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 6],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 9],
  }],
  "Vardiya-Zabiti": ["Vardiya_Zabiti", {
    "Vardiya-Standartlari": ["Vardiya_Standartlari", 8],
    "Seyir": ["Seyir", 5],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 6],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 9],
  }],
  "Uzakyol-Bas-Muhendis": ["Uzakyol_Bas_Muhendis", {
    "Gemi-Yardimci-Makineleri": ["Gemi_Yardimci_Makineleri_Operasyon_ve_Bakimi", 10],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 8],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 10],
  }],
  "Uzakyol-Vardiya-Muhendisi": ["Uzakyol_Vardiya_Muhendisi", {
    "Gemi-Yardimci-Makineleri": ["Gemi_Yardimci_Makineleri_Operasyon_ve_Bakimi", 10],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 8],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 10],
  }],
  "Makine-Zabiti": ["Makine_Zabiti", {
    "Gemi-Yardimci-Makineleri": ["Gemi_Yardimci_Makineleri_Operasyon_ve_Bakimi", 10],
    "Deniz-Hukuku": ["Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 8],
    "Denizcilik-Ingilizcesi": ["Denizcilik_ingilizcesi", 10],
  }],
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
    let soru;
    if (mQ) soru = clean(mQ[1]);
    else soru = clean(content.slice(0, 500));
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

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",") : Object.keys(RANKS);

const manifestPath = join(root, "MANIFEST.json");
let manifest = { kaynak: SITE, ranklar: {} };
if (existsSync(manifestPath)) {
  try {
    const old = JSON.parse(readFileSync(manifestPath, "utf8"));
    // eski tek-rank formatını koru: ranklar altına taşı
    if (old.rank && old.dersler && !old.ranklar) {
      manifest.ranklar["Uzakyol-Vardiya-Zabiti"] = { dersler: old.dersler, toplam_soru: old.toplam_soru };
    } else if (old.ranklar) manifest = old;
  } catch { /* sıfırdan */ }
}

let grand = 0;
for (const rankOut of only) {
  const cfg = RANKS[rankOut];
  if (!cfg) { console.log(`Bilinmeyen rank: ${rankOut}`); continue; }
  const [rankSlug, plan] = cfg;
  let rankTotal = 0;
  const dersOut = {};
  for (const [dersDir, [dersSlug, adet]] of Object.entries(plan)) {
    const ddir = join(root, rankOut, dersDir);
    mkdirSync(ddir, { recursive: true });
    const denemeler = [];
    for (let i = 1; i <= adet; i++) {
      const url = `${SITE}/${rankSlug}/${dersSlug}/Deneme_Sinavi-${i}/`;
      try {
        const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) { console.log(`SKIP ${rankOut}/${dersDir} ${i}: HTTP ${r.status}`); continue; }
        const sorular = parsePage(await r.text());
        rankTotal += sorular.length;
        const fn = `deneme-${String(i).padStart(2, "0")}.json`;
        writeFileSync(join(ddir, fn), JSON.stringify({
          rank: rankOut, ders: dersDir, deneme: i, kaynak_url: url,
          soru_sayisi: sorular.length, sorular,
        }, null, 1));
        denemeler.push({ deneme: i, dosya: `${rankOut}/${dersDir}/${fn}`, soru: sorular.length });
        console.log(`OK ${rankOut}/${dersDir} ${fn}: ${sorular.length}`);
      } catch (e) {
        console.log(`HATA ${rankOut}/${dersDir} ${i}: ${String(e).slice(0, 150)}`);
      }
    }
    dersOut[dersDir] = { kaynak_ders: dersSlug, denemeler };
  }
  manifest.ranklar[rankOut] = { dersler: dersOut, toplam_soru: rankTotal };
}
for (const v of Object.values(manifest.ranklar)) grand += v.toplam_soru || 0;
manifest.toplam_soru = grand;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
console.log("GRAND TOPLAM:", grand);
