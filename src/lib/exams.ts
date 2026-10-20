import type { JobChecklistTemplate } from "./types";

// Zabitan soru havuzu indexi — gerçek dosyalar: /SoruHavuzu/ (2997 soru, doğrulandı).
// Build'i kırmamak için sadece tip + sayım tutulur.

export interface HavuzSoru {
  no: number;
  soru: string;
  gorsel: string[];
  siklar: [string, string, string, string, string];
  cevap: 1 | 2 | 3 | 4 | 5 | null;
}

export interface HavuzDeneme {
  rank: string;
  ders: string;
  deneme: number;
  kaynak_url: string;
  soru_sayisi: number;
  sorular: HavuzSoru[];
}

export const SORU_HAVUZU_INDEX = {
  toplam_soru: 3273,
  deneme_sayisi: 175,
  ranklar: {
    "Uzakyol-Vardiya-Zabiti": { deneme: 28, soru: 507, yol: "SoruHavuzu/Uzakyol-Vardiya-Zabiti" },
    "Uzakyol-I-Zabiti": { deneme: 28, soru: 507, yol: "SoruHavuzu/Uzakyol-I-Zabiti", not: "1.Zabit + Master geçiş (sitede ayrı Master rankı yok)" },
    "Vardiya-Zabiti": { deneme: 28, soru: 507, yol: "SoruHavuzu/Vardiya-Zabiti" },
    "Uzakyol-Bas-Muhendis": { deneme: 28, soru: 492, yol: "SoruHavuzu/Uzakyol-Bas-Muhendis", not: "Chief Engineer (Ana Makine hariç - sitede statik cevap yok)" },
    "Uzakyol-Vardiya-Muhendisi": { deneme: 28, soru: 492, yol: "SoruHavuzu/Uzakyol-Vardiya-Muhendisi", not: "2.Mühendis yolu" },
    "Makine-Zabiti": { deneme: 28, soru: 492, yol: "SoruHavuzu/Makine-Zabiti" },
    "STCW-Temel": { deneme: 7, soru: 276, yol: "SoruHavuzu/STCW-Temel", not: "denizcisin cevap anahtarlı (Temel İlkyardım/Temel Yangın hariç)" },
  },
  dersler: {
    guverte: ["Vardiya-Standartlari", "Seyir", "Deniz-Hukuku", "Denizcilik-Ingilizcesi"],
    makine: ["Gemi-Yardimci-Makineleri", "Deniz-Hukuku", "Denizcilik-Ingilizcesi"],
  },
  kaynak: "https://www.gemiadamlarisinavi.com/testler/",
  not: "Ücretsiz, öğrenci notlarından derleme. GOS garantisi yok. Cevaplar sitedeki sarı işaretlemeden parse edildi. 1 cevapsız (VZ/Seyir/04 no 17) null bırakıldı.",
} as const;

export const HAVUZ_JOB_TEMPLATES: JobChecklistTemplate[] = [
  { id: "gasm-uvz", title: "GASM Uzakyol Vardiya Zabiti Soru Havuzu", description: "507 soru, 4 ders, 28 deneme. SoruHavuzu/Uzakyol-Vardiya-Zabiti.", department: "deck", group: "bridge", items: ["Vardiya Standartları: 145", "Seyir: 97", "Deniz Hukuku: 105", "Denizcilik İngilizcesi: 160"] },
  { id: "gasm-1zabit", title: "GASM Uzakyol I. Zabit Soru Havuzu (Master geçiş)", description: "507 soru, 4 ders, 28 deneme. SoruHavuzu/Uzakyol-I-Zabiti.", department: "deck", group: "bridge", items: ["Vardiya Standartları: 145", "Seyir: 97", "Deniz Hukuku: 105", "Denizcilik İngilizcesi: 160"] },
  { id: "gasm-vz", title: "GASM Vardiya Zabiti Soru Havuzu", description: "507 soru, 4 ders, 28 deneme. SoruHavuzu/Vardiya-Zabiti.", department: "deck", group: "bridge", items: ["Vardiya Standartları: 145", "Seyir: 97", "Deniz Hukuku: 105", "Denizcilik İngilizcesi: 160"] },
  { id: "gasm-basmen", title: "GASM Uzakyol Başmühendis Soru Havuzu", description: "492 soru, 3 ders, 28 deneme (Ana Makine hariç). SoruHavuzu/Uzakyol-Bas-Muhendis.", department: "engine", group: "engine", items: ["Yardımcı Makineler: 179", "Deniz Hukuku: 148", "Denizcilik İngilizcesi: 165"] },
  { id: "gasm-vm", title: "GASM Uzakyol Vardiya Mühendisi Soru Havuzu", description: "492 soru, 3 ders, 28 deneme. SoruHavuzu/Uzakyol-Vardiya-Muhendisi.", department: "engine", group: "engine", items: ["Yardımcı Makineler: 179", "Deniz Hukuku: 148", "Denizcilik İngilizcesi: 165"] },
  { id: "gasm-mz", title: "GASM Makine Zabiti Soru Havuzu", description: "492 soru, 3 ders, 28 deneme. SoruHavuzu/Makine-Zabiti.", department: "engine", group: "engine", items: ["Yardımcı Makineler: 179", "Deniz Hukuku: 148", "Denizcilik İngilizcesi: 165"] },
  { id: "stcw-temel", title: "STCW Temel Soru Havuzu", description: "276 soru, 4 ders, 7 deneme. SoruHavuzu/STCW-Temel. Hazırlık bölümü için.", department: "both", group: "deck", items: ["Can Kurtarma Araçları: 100", "Kişisel Can Kurtarma: 86", "İleri Yangın: 70", "Personel Güvenliği: 20"] },
];

// Eski tekil isimle uyumluluk
export const HAVUZ_JOB_TEMPLATE = HAVUZ_JOB_TEMPLATES[0];
