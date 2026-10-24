// Sample crew quotes (worldwide) — replace with verified crew quotes when
// available (crew wall). Shown on the landing page.
export interface Testimonial {
  name: string;
  rank: string;
  country: string;
  countryCode: string;
  flag: string;
  quote: Record<string, string>; // locale -> text (falls back to en)
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "J. Dela Cruz",
    rank: "2nd Officer",
    country: "Philippines",
    countryCode: "ph",
    flag: "🇵🇭",
    quote: {
      en: "PSC came with zero findings. The check cards had us ready for every question they asked.",
      tr: "PSC sıfır bulguyla geçti. Kontrol kartları sayesinde sordukları her soruya hazırdık.",
    },
  },
  {
    name: "R. Sharma",
    rank: "Bosun",
    country: "India",
    countryCode: "in",
    flag: "🇮🇳",
    quote: {
      en: "The deck checklists run my whole day. Nothing is forgotten, even on a bad-weather week.",
      tr: "Güverte listeleri tüm günümü yönetiyor. Fırtınalı haftada bile hiçbir şey unutulmuyor.",
    },
  },
  {
    name: "O. Kovalenko",
    rank: "Chief Engineer",
    country: "Ukraine",
    countryCode: "ua",
    flag: "🇺🇦",
    quote: {
      en: "Offline store requests and the route planner paid for the app in my first voyage.",
      tr: "Çevrimdışı kumanya talepleri ve rota planlayıcı ilk seferde uygulamanın parasını çıkardı.",
    },
  },
];
