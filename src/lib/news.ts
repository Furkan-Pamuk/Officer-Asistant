export interface NewsPost {
  id: string;
  date: string;
  tag: string;
  title: string;
  body: string[];
}

export const NEWS: NewsPost[] = [
  {
    id: "sire-20-changes",
    date: "2026-10-01",
    tag: "Vetting",
    title: "SIRE 2.0: what actually draws observations",
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
    body: [
      "One workspace per contract: check cards with completion dates, job checklists, to-dos, notes with voice + reminders, store requests with IMPA codes, weekly menus, crew accounts and service-time tracking.",
      "Everything works offline at sea and syncs from this device. Fair winds!",
    ],
  },
];

