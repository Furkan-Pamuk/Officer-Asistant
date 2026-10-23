// STCW havuzu toplayıcı (denizcisin.com — statik cevap anahtarlı testler).
// Doğruluk çapraz kontrollü: data-correct="True" + "Doğru Cevap" metni.
// Kullanım: node SoruHavuzu/scrape-stcw.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)));

const PLAN = {
  "Can-Kurtarma-Araclari": [
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-cankurtarma-araclarini-kullanma-yeterliligi-test-1/",
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-cankurtarma-araclarini-kullanma-yeterliligi-test-2/",
  ],
  "Kisisel-Can-Kurtarma": [
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-denizde-kisisel-can-kurtarma-teknikleri-test-1/",
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-denizde-kisisel-can-kurtarma-teknikleri-test-2/",
  ],
  "Ileri-Yangin": [
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-ileri-yangin-sorulari-test-1/",
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-ileri-yangin-sorulari-test-2/",
  ],
  "Personel-Guvenligi": [
    "https://denizcisin.com/index.php/2017/01/27/stcw-soru-personel-guvenligi-ve-sosyal-sorumluluk-test-1/",
  ],
};

function clean(s) {
  return (s || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

function letterToNum(l) {
  return { A: 1, B: 2, C: 3, D: 4, E: 5 }[l] ?? null;
}

function parsePage(page, url) {
  const blocks = page.split(/<div class="question" data-question-id="/);
  const out = [];
  for (let b = 1; b < blocks.length; b++) {
    const c = blocks[b];
    const mNo = c.match(/^(\d+)"/);
    const no = mNo ? parseInt(mNo[1], 10) : b;
    const mQ = c.match(/<div class="question_content">[\s\S]*?<strong>([\s\S]*?)<\/strong>/);
    const soru = clean(mQ ? mQ[1] : "");
    // seçenekler sırayla
    const optRe = /<input[^>]*data-correct="(True|False)"[^>]*data-option-text="([A-E])"[^>]*>[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>/g;
    const siklar = ["", "", "", "", ""];
    let cevap = null, m;
    while ((m = optRe.exec(c)) !== null) {
      const n = letterToNum(m[2]);
      siklar[n - 1] = clean(m[3]).replace(/^[A-E]\.\s*/, "");
      if (m[1] === "True") cevap = n;
    }
    // çapraz kontrol: Doğru Cevap metni
    const mA = c.match(/Do\u011fru Cevap:\s*<\/strong>\s*"([A-E])"/);
    if (mA) {
      const n = letterToNum(mA[1]);
      if (cevap && cevap !== n) {
        console.log(`UYARI ${url} no ${no}: data-correct=${cevap} ama metin=${n}`);
      }
      if (!cevap) cevap = n;
    }
    if (soru) out.push({ no, soru, gorsel: [], siklar, cevap });
  }
  return out;
}

const manifest = { rank: "STCW-Temel", dersler: {} };
let total = 0, nul = 0;
for (const [ders, urls] of Object.entries(PLAN)) {
  const ddir = join(root, "STCW-Temel", ders);
  mkdirSync(ddir, { recursive: true });
  manifest.dersler[ders] = { kaynak: "denizcisin.com", denemeler: [] };
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const sorular = parsePage(await r.text(), url);
    const nulls = sorular.filter((s) => !s.cevap).length;
    total += sorular.length; nul += nulls;
    const fn = `deneme-${String(i + 1).padStart(2, "0")}.json`;
    writeFileSync(join(ddir, fn), JSON.stringify({
      rank: "STCW-Temel", ders, deneme: i + 1, kaynak_url: url,
      soru_sayisi: sorular.length, sorular,
    }, null, 1));
    manifest.dersler[ders].denemeler.push({ deneme: i + 1, dosya: `STCW-Temel/${ders}/${fn}`, soru: sorular.length });
    console.log(`OK STCW-Temel/${ders} ${fn}: ${sorular.length} soru (cevapsız ${nulls})`);
  }
}
manifest.toplam_soru = total;
manifest.cevapsiz = nul;
writeFileSync(join(root, "STCW-Temel", "MANIFEST.json"), JSON.stringify(manifest, null, 1));
console.log("STCW TOPLAM:", total, "cevapsız:", nul);
