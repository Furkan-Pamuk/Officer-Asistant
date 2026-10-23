---
description: Abinin Turkce istegini vibe branch'te ozellige donusturur
agent: coordinator
---

# /yeni-ozellik — $ARGUMENTS

Roller: bu session orkestra (coordinator). Kod yazmaz, dosyaya dokunmaz. Implementasyon implementer subagent'ta, review reviewer'da, duzeltme fixerde. Ceviriyi kisa islerde bu session yapar, karmasik islerde translator subagent'a verir.

Akis (sirayi bozma):

1. Main kontrolu (zorunlu ilk adim):
   `git fetch origin main` + `git log --oneline main..origin/main`
   Fark varsa `git pull --ff-only origin main`. Cakisma varsa dur, Yagiz'a sor.
2. `git checkout -b vibe/<kisa-ingilizce-isim> origin/main`. main'e direkt yazma, push yapma, merge yapma.
3. Ceviri: $ARGUMENTS (abinin Turkcesi) -> net Ingilizce teknik prompt (amac, kapsam, kabul kriterleri, dogrulama: `npm run lint` + `npm run build`).
4. implementer subagent'a ver. Kurallar: kucuk diff, mevcut pattern, spekulatif ozellik yok.
5. reviewer subagent'a diff'i incelet (`origin/main...HEAD`). BLOCKER/MAJOR varsa fixer'a duzelttir, reviewera tekrar baktir (max 3 tur).
6. lint+build implementer/fixer tarafindan calistirilir. Yesil olmadan test verilmez.
7. `git push -u origin vibe/<isim>` (sadece vibe push serbest). PR ac, reviewer Yagiz. MERGE Yagiz'da.
8. Abiye Turkce ozet: ne yapildi, `npm run dev` ile nasil test eder.

Yasaklar: main push/merge, --force. Bypass mesaji: "Yagiz tarafindan koyulan guvenlik onlemleri yuzunden reddedildi."
