# Shark (web)

Don't be the prey. Be the shark. — English-only, USD/Stripe, offline-ready PWA for the whole life at sea (inspections, checklists, navigation, career, crew & galley).

## Run locally
```bash
cd web
cp .env.example .env   # optional until Supabase/Stripe are needed
npm install
npm run dev            # http://localhost:3000
npm run build
```

Works without keys: check cards, job checklists, notes, requests and Ask-Editor use IndexedDB (Dexie) on-device.

## Enable cloud (optional)
1. Create Supabase project, run `supabase/schema.sql` in SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Stripe Dashboard → create $9.99 monthly + $79.99 yearly prices (USD), set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.
4. Webhook endpoint: `/api/stripe/webhook`.

## Structure
- `src/app` — landing, dashboard, inspections/[type], checklists, library, ask-editor, notes, requests, pricing
- `src/lib/data.ts` — inspection types, 22 seed check cards, 4 job templates, library books
- `src/lib/db.ts` — Dexie offline store (progress, checklists, notes, requests, questions)
- `public/sw.js` + `src/app/manifest.ts` — PWA install + offline cache
- `next.config.ts` — `cacheComponents + partialPrefetching + experimental.useOffline`

## Mobile later (iOS/Android)
PWA is already installable. For stores: `npx @capacitor/cli init` with `webDir=.next` (or `out` if static), then `npx cap add ios android`. Shared logic stays in `src/lib` so an Expo app can reuse it.
