export const BRAND = "Shark";
export const TAGLINE = "Don't be the prey. Be the shark.";
export const TAGLINE_LONG =
  "Your whole life at sea, in one app — inspections, checklists, navigation tools, career and daily life aboard. Offline-first, in English, priced in USD.";

export const MISSION =
  "To give every seafarer one offline-first companion for their whole life at sea — inspection readiness, daily work, navigation, career and life aboard — built for officers, cadets and ratings alike, with or without a signal.";

export const VISION =
  "To become the app every seafarer keeps on their phone — the reason no crew faces inspections, paperwork or life aboard unprepared.";

export const VALUES: { title: string; body: string }[] = [
  { title: "Offline-first", body: "Everything that matters works at sea with no signal. Data lives on your device, not on a server you cannot reach." },
  { title: "One contract, one memory", body: "Every vessel gets its own archive — progress, notes and lists. Switch ships without losing a thing." },
  { title: "Fair and transparent", body: "Priced in USD, no hidden tiers, no ads. The free plan is genuinely usable." },
  { title: "Built by seafarers", body: "Made by people who have stood the watches, sat the inspections and chased the paperwork." },
];

export const FEATURES: { icon: string; title: string; body: string }[] = [
  { icon: "🦈", title: "Inspection check cards", body: "Flag, PSC, SIRE 2.0, CDI, Sanitation and ISM cards with completion dates you can show an inspector." },
  { icon: "✅", title: "Job checklists", body: "Daily, weekly and monthly routines plus pre-arrival, bunkering and job checklists — per rank, with on/off switches." },
  { icon: "🧭", title: "Navigation tools", body: "Live AIS and GPS tracking, offline celestial math for compass checks, port directory with VHF channels, deck log book." },
  { icon: "🎓", title: "Career", body: "CV builder with STCW certificate tracking and expiry alerts, sea service counted automatically from your contracts." },
  { icon: "📦", title: "Store requests", body: "IMPA catalogue import with smart suggestions as you type, plus export for the order." },
  { icon: "👥", title: "Crew & galley", body: "Crew accounts in three currencies, weekly menu planner with kcal, service-time tracking and GIBS deadline counters." },
  { icon: "📝", title: "Notes & reminders", body: "Voice notes, dictation and alarms — for handovers, defects and anything you must not forget." },
  { icon: "📚", title: "Library", body: "Reference books and manuals kept close, ready to open without hunting through a drawer." },
];

export const FAQ: { q: string; a: string }[] = [
  { q: "Why is it called Shark?", a: "Because at sea you are either the prey or the hunter. Inspections, paperwork, endless checks — Shark keeps you sharp across your whole life aboard, so you meet every inspection as the hunter, not the prey. Don't be the prey. Be the shark." },
  { q: "Is Shark only for inspections?", a: "No. Inspection readiness is the flagship, but Shark covers daily work checklists, navigation tools, store requests, crew accounts, menus, career documents and life aboard — one offline-first workspace per contract." },
  { q: "Does the app work offline at sea?", a: "Yes. Check cards, checklists, notes, requests, menus and to-dos are stored on your device (IndexedDB) and work without internet. Market rates, weather and maps need a connection once, then show cached data." },
  { q: "How do contracts and archives work?", a: "Each vessel gets its own contract with separate progress, notes and lists. Ending a contract archives it with the sign-off date — open View archive any time, or Reactivate it." },
  { q: "What is the 60-day GIBS rule?", a: "Upload joining ordino + contract within 60 days of sign-on, and sign-off ordino + service letter within 60 days of sign-off. Dashboard counters track both deadlines and turn red in the last 5 days." },
  { q: "Where is my data stored? Is there a backup?", a: "On this device only, unless you connect Supabase. Use Export full backup in Settings before clearing browser data. Nothing is uploaded by default." },
  { q: "What is the difference between Free and Pro?", a: "Free covers 20 check cards, 1 job checklist and 10 notes, and keeps working offline forever. Pro Monthly ($9.99) and Pro Yearly ($79.99) unlock every inspection type, unlimited checklists and notes, store request export and the offline PWA mode." },
  { q: "How do subscriptions work?", a: "Payments run through Stripe in USD. You can cancel any time from your Stripe receipt link or by contacting support — access continues until the end of the paid period, and nothing auto-downgrades your data." },
  { q: "What happens if I lose my phone or clear the browser?", a: "Your data lives on that device, so export a backup from Settings first. With Supabase connected, your cloud copy can be restored on a new device after you sign in." },
  { q: "How do I install it on my phone?", a: "Open the site in your mobile browser and use Add to Home Screen. Shark is a PWA: it installs like a normal app, launches full screen and keeps working offline. iOS and Android store builds are planned later." },
  { q: "How do I import my IMPA catalogue?", a: "Requests → IMPA catalogue → Import CSV with code,name,unit,category columns. Products you type are suggested automatically as you write." },
  { q: "Do note reminders work when the app is closed?", a: "Reminders fire while the app (or installed PWA) is open. Keep it open in harbour for alarms; at sea, treat them as on-watch prompts." },
  { q: "Which languages are supported?", a: "The interface is English for now; Turkish is planned. Voice notes and dictation already support both English and Turkish." },
  { q: "Is my data private?", a: "Yes. Everything stays on your device unless you deliberately connect Supabase. There are no ads, no trackers and no selling of user data." },
];
