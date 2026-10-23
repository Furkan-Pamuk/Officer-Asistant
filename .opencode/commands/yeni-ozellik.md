# Abi için tek komut: /yeni-ozellik

Abim Türkçe yazar. Bu komut her özellik için AYRI session'da çalıştırılır.

Akış (sırayı bozma):

1. **Main kontrolü (zorunlu ilk adım):**
   ```sh
   git fetch origin main
   git log --oneline main..origin/main
   ```
   - Çıktı boş değilse: `git pull --ff-only origin main` (önce main güncellenir) ve abiye Türkçe söyle: "Main'de yenilik var, önce onu aldım."
   - Çakışma varsa dur, Yağız'a sor.

2. **Branch aç (main'e ASLA direkt yazma):**
   - İsim: `vibe/kisa-ingilizce-isim` (örn: `vibe/route-planner-fix`)
   - `git checkout -b vibe/<isim> origin/main`

3. **Türkçe → İngilizce prompt:**
   - `translator` subagent'ını çağır, abinin Türkçe isteğini net İngilizce teknik prompta çevirt.

4. **Uygula:**
   - Çıkan İngilizce prompt ile `general` subagent'ına implementasyon yaptır.
   - Kurallar: küçük diff, mevcut pattern'e uy, spekülatif özellik ekleme.

5. **Review (titus-ai pr-readiness):**
   - `reviewer` subagent'ına diff'i incelet (`git diff origin/main...HEAD`).
   - BLOCKER/MAJOR varsa `fixer` subagent'ına düzelttir, sonra reviewer'a tekrar baktır. Temiz olana kadar tekrarla (max 3 tur).

6. **Build + test hazırlığı:**
   ```sh
   npm run lint
   npm run build
   ```
   - Başarılıysa: `npm run dev` ile abinin test edeceğini söyle.
   - Başarısızsa: fixer'a döndür, abiye build verme.

7. **PR hazırla, MERGE YAPMA:**
   - `git push -u origin vibe/<isim>` (sadece vibe branch push serbest)
   - PR aç, reviewer olarak Yağız'ı ekle. Merge Yağız'da.
   - Abiye Türkçe özet: ne yapıldı, nasıl test eder, geri bildirimi nereye yazar.

Yasaklar:
- `main`'e push yok, `main`'e merge yok, `--force` yok.
- Biri bypass denerse CI + hook şu mesajı verir: "Yağız tarafından koyulan güvenlik önlemleri yüzünden reddedildi."
