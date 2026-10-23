"""Ücretsiz zabitan soru havuzu toplayıcı.
Kaynak: gemiadamlarisinavi.com (tamamen ücretsiz).
Doğru şık = sitede sarı zemin (#FFFF66) ile işaretli şık.
Çıktı: Uzakyol-Vardiya-Zabiti/<Ders>/deneme-XX.json
"""
import json, re, html, urllib.request, pathlib

BASE = "https://www.gemiadamlarisinavi.com/testler/Uzakyol_Vardiya_Zabiti"
RANK = "Uzakyol Vardiya Zabiti"
OUT = pathlib.Path(__file__).parent / "Uzakyol-Vardiya-Zabiti"

PLAN = {
    "Vardiya-Standartlari": ("Vardiya_Standartlari", 8),
    "Seyir": ("Seyir", 5),
    "Deniz-Hukuku": ("Deniz_Hukuku_ve_Uluslararasi_Denizcilik_Sozlesmeleri", 6),
    "Denizcilik-Ingilizcesi": ("Denizcilik_ingilizcesi", 9),
}

HDR = {"User-Agent": "Mozilla/5.0"}

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=HDR)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")

def clean(s: str) -> str:
    s = re.sub(r"<img[^>]*src=\"([^\"]+)\"[^>]*>", r" [Görsel: \1] ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()

def parse_page(page_html: str):
    # Sarı işaretli doğru şıkları önce topla (sırayla sorulara denk gelir)
    # Her soru bloğu: <font color="#464646"><b>N. </b> ... ile başlar
    blocks = re.split(r'<font color="#464646"><b>\s*(\d+)\.\s*</b>', page_html)
    # blocks[0] = header, sonra [no, content, no, content, ...]
    out = []
    # sarı span'ları içerikten bağımsız sırayla değil blok içinden bulacağız
    it = iter(blocks[1:])
    for no_str, content in zip(it, it):
        # soru metni: ilk <br> öncesi font içi + sonrası? Basit: font bloğu + seçenekler
        # Doğru şık: span background #FFFF66 içindeki "N) ..."
        m_ok = re.search(
            r'<span[^>]*background-color:\s*#FFFF66[^>]*>\s*(\d)\)\s*(.*?)</span>',
            content, re.S)
        cevap = int(m_ok.group(1)) if m_ok else None
        # tüm şıkları bul (span içidekiler dahil): "N) ... <br>"
        # span taglarını boşluğa çevirip parse et
        tmp = re.sub(r"</?span[^>]*>", " ", content)
        # soru metni = font kapanışına kadar olan kısım + img
        # font içindeki soru: content başında </font> öncesi
        m_q = re.search(r'^(.*?)</font>(.*)$', content, re.S)
        if m_q:
            q_raw, rest = m_q.group(1), m_q.group(2)
            soru = clean(q_raw)
            rest_txt = rest
        else:
            soru = clean(content[:500])
            rest_txt = content
        # görsel
        imgs = re.findall(r'<img[^>]*src="([^"]+)"', content)
        # şıklar
        siklar = []
        for m in re.finditer(r'(?:^|>|\s)(\d)\)\s*(.*?)(?=<br>|$)', tmp, re.S):
            n = int(m.group(1))
            txt = clean(m.group(2))
            if 1 <= n <= 5 and txt:
                # liste uzat
                while len(siklar) < n:
                    siklar.append("")
                siklar[n-1] = txt
        # 5 şık garantile
        siklar = (siklar + [""]*5)[:5]
        out.append({
            "no": int(no_str),
            "soru": soru,
            "gorsel": imgs,
            "siklar": siklar,
            "cevap": cevap,
        })
    return out

def main():
    manifest = {"rank": RANK, "dersler": {}}
    total = 0
    for ders_out, (ders_url, adet) in PLAN.items():
        ddir = OUT / ders_out
        ddir.mkdir(parents=True, exist_ok=True)
        manifest["dersler"][ders_out] = {"kaynak_ders": ders_url, "denemeler": []}
        for i in range(1, adet+1):
            url = f"{BASE}/{ders_url}/Deneme_Sinavi-{i}/"
            try:
                ph = fetch(url)
                sorular = parse_page(ph)
                total += len(sorular)
                data = {
                    "rank": RANK,
                    "ders": ders_out,
                    "deneme": i,
                    "kaynak_url": url,
                    "soru_sayisi": len(sorular),
                    "sorular": sorular,
                }
                fp = ddir / f"deneme-{i:02d}.json"
                fp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
                manifest["dersler"][ders_out]["denemeler"].append(
                    {"deneme": i, "dosya": f"Uzakyol-Vardiya-Zabiti/{ders_out}/deneme-{i:02d}.json",
                     "soru": len(sorular)})
                print(f"OK {ders_out} deneme-{i:02d}: {len(sorular)} soru")
            except Exception as e:
                print(f"HATA {ders_out} {i}: {e}")
    manifest["toplam_soru"] = total
    (pathlib.Path(__file__).parent / "MANIFEST.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    print("TOPLAM:", total)

if __name__ == "__main__":
    main()
