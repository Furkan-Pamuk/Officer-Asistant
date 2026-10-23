<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Yagiz-Furkan calisma duzeni (abinin makinesinde gecerli)

- Abim Turkce yazar. Her ozellik icin AYRI session ac: `/yeni-ozellik`.
- Ilk adim her zaman: `git fetch origin main` + `git log --oneline main..origin/main`. Fark varsa `git pull --ff-only origin main`.
- Dogrudan `main`'e kod yazma, push yapma, merge yapma. Tum is `vibe/<isim>` branch'inde.
- Akis: `translator` (TR->EN) -> `general` subagent implemente -> `reviewer` (titus-ai pr-readiness tarzi) -> sorun varsa `fixer` -> tekrar reviewer (max 3 tur) -> `npm run lint` + `npm run build` -> `npm run dev` ile abi test eder -> PR ac, merge Yagiz'da.
- Bypass mesaji (hook + CI'da): "Yagiz tarafindan koyulan guvenlik onlemleri yuzunden reddedildi."
- Review kaldirici degil, titus-ai kurali: dogrulanabilir kod, kucuk diff, mevcut pattern, uydurma path/API yok.
