# Soru Havuzu — Zabitan (rank → ders → deneme)

Ücretsiz kaynaklardan derlenmiş, cevap anahtarlı soru havuzu.

## Kaynak (ücretsiz)
- `gemiadamlarisinavi.com/testler/` — tamamen ücretsiz, öğrenci ders notlarından derlenmiş.
  Site notu: GOS'da aynısı çıkar garantisi yok, doğruluk sorumluluğu kabul edilmez.
- Master (Uzakyol Kaptan) için sitede ayrı rank yok — yönetim seviyesi olarak
  `Uzakyol-I-Zabiti` + `themastermariner.com/stcw-exam-questions` (A-II/2, ücretsiz e-kitap) kullanıldı.
- 2. Mühendis için sitede ayrı rank yok — yol `Uzakyol-Vardiya-Muhendisi` → `Uzakyol-Bas-Muhendis`.

## Kapsam (doğrulandı)
| Rank (klasör) | Dersler | Deneme | Soru |
|------|---------|--------|------|
| Uzakyol-Vardiya-Zabiti | Vardiya-Standartlari 145, Seyir 97, Deniz-Hukuku 105, Denizcilik-Ingilizcesi 160 | 28 | 507 |
| Uzakyol-I-Zabiti (1.Zabit / Master geçiş) | aynı 4 ders | 28 | 507 |
| Vardiya-Zabiti | aynı 4 ders | 28 | 507 |
| Uzakyol-Bas-Muhendis (Chief Engineer) | Yardimci-Makineler 179, Hukuku 148, İngilizce 165 | 28 | 492 |
| Uzakyol-Vardiya-Muhendisi (2.Müh yol) | aynı 3 ders | 28 | 492 |
| Makine-Zabiti | aynı 3 ders | 28 | 492 |
| STCW-Temel (denizcisin, cevap anahtarlı) | Can-Kurtarma 100, Kisisel-Can-Kurtarma 86, Ileri-Yangin 70, Personel-Guvenligi 20 | 7 | 276 |
| **GRAND TOPLAM** | | **175** | **3273** |

Notlar:
- Güverte 3 rankı aynı soru bankını paylaşıyor (sitede geçme notu farklı: UVZ 70 / I.Zabit 65-70 / VZ 50-60). Rank klasmanında ayrı tutuldu.
- Makine 3 rankı da aynı bankı paylaşıyor.
- 2997 zabitan sorusunda 1 cevapsız var: `Vardiya-Zabiti/Seyir/deneme-04.json` no 17 (sitede işaretleme yok, `cevap: null` bırakıldı — uydurulmadı).
- STCW 276 soruda 1 cevapsız var: `STCW-Temel/Ileri-Yangin/deneme-02.json` no 19 (sitede işaretleme yok, `null` bırakıldı).
- Ana Makine dersi hariç: sitede statik cevap-anahtarı sayfası yok, sadece interaktif `test.php?testid=` arşivi var (site "910 farklı soru, 46 deneme" yazıyor). Cevapsız çekilmedi.
- STCW eksikler: Temel İlkyardım + Temel Yangın Önleme denizcisin STCW kategorisinde yok (gemiadamlarisinavi'nda interaktif test.php arşivi var: İlkyardım 129 soru/7 deneme, Yangın 209 soru/11 deneme, +150-180 civarı diğerleri). Hazırlık bölümü için bunlar interaktiften eklenebilir.

## Dosya yapısı
```
SoruHavuzu/
  README.md
  MANIFEST.json
  scrape.mjs        (ilk UVZ çekimi)
  scrape-all.mjs    (tüm ranklar; --only=Rank1,Rank2)
  scrape-stcw.mjs   (STCW-Temel, denizcisin)
  scrape.py         (eski python taslak, kullanılmıyor - node kullan)
  Uzakyol-Vardiya-Zabiti/Vardiya-Standartlari/deneme-01.json ...
  Uzakyol-I-Zabiti/...
  Vardiya-Zabiti/...
  Uzakyol-Bas-Muhendis/Gemi-Yardimci-Makineleri/... Deniz-Hukuku/... Denizcilik-Ingilizcesi/...
  Uzakyol-Vardiya-Muhendisi/...
  Makine-Zabiti/...
  STCW-Temel/Can-Kurtarma-Araclari/... Kisisel-Can-Kurtarma/... Ileri-Yangin/... Personel-Guvenligi/...
  STCW-Temel/MANIFEST.json
```

Her JSON: `{ rank, ders, deneme, kaynak_url, soru_sayisi, sorular: [{ no, soru, gorsel, siklar:[5], cevap: 1-5|null }] }`
- `cevap`: zabitan havuzunda sitedeki sarı (`#FFFF66`), STCW havuzunda `data-correct="True"` + "Doğru Cevap" metni (çapraz kontrollü).
- `gorsel`: `2.png` gibi siteye göreli resim adı; şekil için `kaynak_url` aç.
- Görselli sorularda şekil JSON'da yok, siteden bak.

## Kullanım
- Web: `web/src/lib/exams.ts` → `SORU_HAVUZU_INDEX`.
- Yenileme: `node SoruHavuzu/scrape-all.mjs [--only=Uzakyol-I-Zabiti,Vardiya-Zabiti]`
- STCW yenileme: `node SoruHavuzu/scrape-stcw.mjs`
