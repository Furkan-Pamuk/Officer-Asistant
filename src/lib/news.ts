export type NewsSection = "news" | "crew" | "blog" | "guide";

export interface NewsPost {
  id: string;
  date: string;
  tag: string;
  title: string;
  body: string[];
  section: NewsSection;
  author?: string;
  port?: string;
}

export const SECTIONS: { id: NewsSection; label: string; blurb: string }[] = [
  { id: "news", label: "📰 News", blurb: "Fleet, regulation and Shark updates." },
  { id: "crew", label: "💬 Sizden Gelenler", blurb: "Stories from the crew, for the crew." },
  { id: "blog", label: "✍️ Blogs", blurb: "Life-at-sea reads from the Shark team." },
  { id: "guide", label: "🗺️ What to do & where to eat", blurb: "Port-city tips: sights and food near the berth." },
];

export const NEWS: NewsPost[] = [
  {
    id: "vhf-presets",
    date: "2026-10-20",
    tag: "App",
    title: "Port Info now has VHF channels for 85 ports",
    section: "news",
    author: "Shark Team",
    body: [
      "Port Info ships with verified VHF working channels (VTS, pilots, harbour, port control) for 85 of the 109 bundled ports, researched from port authority and VTS sources.",
      "Ports with presets carry a 📻 badge; the rest stay open for your ALRS entries. Presets are a starting point — always confirm with ALRS Vol 6 before calling.",
      "The same directory now also lives under the Route Planner map, next to the load-line zone card.",
    ],
  },
  {
    id: "sire-20-changes",
    date: "2026-10-01",
    tag: "Vetting",
    title: "SIRE 2.0: what actually draws observations",
    section: "news",
    author: "Shark Team",
    body: [
      "Across the question library, the same pattern repeats: the inspector interviews the officer doing the job, not the master. Every operational question ends with records plus a crew interview.",
      "Highest-yield prep: permit-to-work culture (enclosed space, hot work, aloft), gas instrument calibration, passage plan UKC worksheets, and photo-round housekeeping — lagging, labels, leaks.",
      "Our SIRE check cards (sire-101 to sire-124) mirror the 12 chapters so you can work them top to bottom before the vetting date.",
    ],
  },
  {
    id: "psc-focus",
    date: "2026-09-12",
    tag: "PSC",
    title: "PSC focus: things inspectors test live",
    section: "news",
    author: "Shark Team",
    body: [
      "ECDIS manual update on the spot, VDR save procedure, BNWAS on DC power, emergency fire pump under load, OWS 15 ppm alarm — inspectors increasingly ask the officer to demonstrate, not just show papers.",
      "Tip from real bridge reports in our docs: keep the wheelhouse poster and pilot card consistent line by line, and know your minimum steering speed with trial graphs at hand.",
    ],
  },
  {
    id: "gibs-60day",
    date: "2026-08-28",
    tag: "Paperwork",
    title: "GIBS 60-day rule: joining and sign-off docs",
    section: "news",
    author: "Shark Team",
    body: [
      "Upload joining ordino + contract and, after sign-off, sign-off ordino + service letter within 60 days. The dashboard counters track both deadlines per contract.",
      "Mark a set as uploaded and the box turns green; the archive keeps the dates for your service record.",
    ],
  },
  {
    id: "welcome",
    date: "2026-08-01",
    tag: "Blog",
    title: "Welcome aboard Shark",
    section: "blog",
    author: "Shark Team",
    body: [
      "One workspace per contract: check cards with completion dates, job checklists, to-dos, notes with voice + reminders, store requests with IMPA codes, weekly menus, crew accounts and service-time tracking.",
      "Everything works offline at sea and syncs from this device. Fair winds!",
    ],
  },
  {
    id: "boredom-crossings",
    date: "2026-09-20",
    tag: "Life",
    title: "Beating boredom on long crossings",
    section: "blog",
    author: "Shark Team",
    body: [
      "After day ten the ocean looks the same everywhere. The crews that stay sharp build routines: a learning hour (license prep, languages), a fitness hour, and one social ritual — film night, galley competition, sunset photos.",
      "Keep a personal log beyond the official one: three lines a day about weather, work and mood. On sign-off it reads like a different voyage than the one you remember.",
      "Use the downtime for tickets: most officers finish their next-grade prep at sea, one chapter per crossing.",
    ],
  },
  {
    id: "galley-nations",
    date: "2026-09-05",
    tag: "Life",
    title: "Cooking for six nationalities in one galley",
    section: "blog",
    author: "Shark Team",
    body: [
      "One menu never fits all: rice must be right, bread must exist, and spice tolerance splits the mess in two. The best cooks run a mild base plus a hot side — everybody eats, nobody complains.",
      "Festival days matter more than Sundays. Ask the crew for one home dish each and put it on the weekly menu; the menu module has a notes field exactly for that.",
      "Stores are the limit: check the provisions against the voyage length before sailing, and keep a two-week buffer of the staples your crew actually eats.",
    ],
  },
  {
    id: "crew-wall-first",
    date: "2026-10-18",
    tag: "Crew",
    title: "This wall is yours — post the first story",
    section: "crew",
    author: "Shark Team",
    body: [
      "Sizden Gelenler is the crew's own wall: funny bridge moments, ports that surprised you, galley victories, storms you won't forget.",
      "Use the form below — nickname, title and your story. It stays on your device and you can share it anywhere.",
      "House rule: no company names in blame stories, no personal data of others. Sea stories, not gossip.",
    ],
  },
  {
    id: "guide-istanbul",
    date: "2026-10-10",
    tag: "Guide",
    title: "Istanbul in 24 hours: Balat to Karaköy",
    section: "guide",
    author: "Shark Team",
    port: "Istanbul (TRIST)",
    body: [
      "What to do: walk Balat and Fener's coloured streets down to the Golden Horn, ferry across to Karaköy at sunset, and if time allows, the Grand Bazaar early morning before the crowds.",
      "Where to eat: Karaköy Güllüoğlu for baklava, a balık-ekmek at the Eminönü boats, and any esnaf lokantası behind the Spice Bazaar for a proper lunch under an hour.",
      "Crew tips change fast — verify opening hours locally; do a group run, keep phones charged and agree a meeting point before splitting up.",
    ],
  },
  {
    id: "guide-singapore",
    date: "2026-10-08",
    tag: "Guide",
    title: "Singapore on a short stay: hawker first",
    section: "guide",
    author: "Shark Team",
    port: "Singapore (SGSIN)",
    body: [
      "What to do: Marina Bay evening walk, Gardens by the Bay light show, and Mustafa Centre in Little India — open 24 hours, perfect for odd sign-off times.",
      "Where to eat: Lau Pa Sat satay street after 19:00, Tian Tian chicken rice at Maxwell, and kaya toast with kopi for breakfast anywhere near the hotel.",
      "Crew tips change fast — verify opening hours locally; the MRT from the port area beats any taxi in rush hour.",
    ],
  },
  {
    id: "guide-rotterdam",
    date: "2026-10-05",
    tag: "Guide",
    title: "Rotterdam: harbour city in half a day",
    section: "guide",
    author: "Shark Team",
    port: "Rotterdam (NLRTM)",
    body: [
      "What to do: Euromast panorama, the Cube Houses and Markthal under one roof, and a Spido harbour tour to see the port from the water side.",
      "Where to eat: Markthal food hall for everything at once, Witte de Withstraat for evening bars, and proper Dutch apple pie anywhere with 'appeltaart' on the board.",
      "Crew tips change fast — verify opening hours locally; bikes beat trams if the weather holds.",
    ],
  },
  {
    id: "guide-barcelona",
    date: "2026-10-02",
    tag: "Guide",
    title: "Barcelona: old town and sea in one run",
    section: "guide",
    author: "Shark Team",
    port: "Barcelona (ESBCN)",
    body: [
      "What to do: Gothic Quarter lanes, La Boqueria market hall in the morning, then Barceloneta beach walk to cool off.",
      "Where to eat: market tapas inside La Boqueria, paella near the Barceloneta waterfront, and churros with chocolate in the old town.",
      "Crew tips change fast — verify opening hours locally; watch pockets in crowds as in any big port city.",
    ],
  },
];

