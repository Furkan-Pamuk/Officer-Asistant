"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { EXAM_RANKS, EXAM_TOPLAM_SORU, EXAM_TOPLAM_DENEME } from "@/lib/exam-data";
import { DENEMELER as D_STCW } from "@/lib/exam-data/stcw-temel";
import { DENEMELER as D_MZ } from "@/lib/exam-data/makine-zabiti";
import { DENEMELER as D_UVZ } from "@/lib/exam-data/uzakyol-vardiya-zabiti";
import { DENEMELER as D_VZ } from "@/lib/exam-data/vardiya-zabiti";
import { DENEMELER as D_UIZ } from "@/lib/exam-data/uzakyol-i-zabiti";
import { DENEMELER as D_UBM } from "@/lib/exam-data/uzakyol-bas-muhendis";
import { DENEMELER as D_UVM } from "@/lib/exam-data/uzakyol-vardiya-muhendisi";
import { DENEMELER_EN as E_STCW } from "@/lib/exam-data/en/stcw-temel";
import { DENEMELER_EN as E_MZ } from "@/lib/exam-data/en/makine-zabiti";
import { DENEMELER_EN as E_UVZ } from "@/lib/exam-data/en/uzakyol-vardiya-zabiti";
import { DENEMELER_EN as E_VZ } from "@/lib/exam-data/en/vardiya-zabiti";
import { DENEMELER_EN as E_UIZ } from "@/lib/exam-data/en/uzakyol-i-zabiti";
import { DENEMELER_EN as E_UBM } from "@/lib/exam-data/en/uzakyol-bas-muhendis";
import { DENEMELER_EN as E_UVM } from "@/lib/exam-data/en/uzakyol-vardiya-muhendisi";
import type { HavuzDeneme } from "@/lib/exams";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";

interface EnSoru { no: number; soru_en: string; siklar_en: string[] }
interface EnDeneme { ders: string; deneme: number; sorular: EnSoru[] }

const RANK_DATA: Record<string, HavuzDeneme[]> = {
  "stcw-temel": D_STCW,
  "makine-zabiti": D_MZ,
  "uzakyol-vardiya-zabiti": D_UVZ,
  "vardiya-zabiti": D_VZ,
  "uzakyol-i-zabiti": D_UIZ,
  "uzakyol-bas-muhendis": D_UBM,
  "uzakyol-vardiya-muhendisi": D_UVM,
};

// Answers live in localStorage and params are runtime-only: never prerender
// (see page.tsx `instant`).

const RANK_EN_QA: Record<string, EnDeneme[]> = {
  "stcw-temel": E_STCW,
  "makine-zabiti": E_MZ,
  "uzakyol-vardiya-zabiti": E_UVZ,
  "vardiya-zabiti": E_VZ,
  "uzakyol-i-zabiti": E_UIZ,
  "uzakyol-bas-muhendis": E_UBM,
  "uzakyol-vardiya-muhendisi": E_UVM,
};

const HARFLER = ["A", "B", "C", "D", "E"];
const LS_KEY = "oa-exam-v1";

type Lang = "tr" | "en";
const LANG_KEY = "oa-exam-lang";

// i18n keys for rank/pool display names (app locale governs the chrome;
// the TR/EN content toggle below only affects questions/options).
const RANK_KEY: Record<string, string> = {
  "makine-zabiti": "exam.rankEng",
  "uzakyol-bas-muhendis": "exam.rankCE",
  "uzakyol-i-zabiti": "exam.rankCO",
  "uzakyol-vardiya-muhendisi": "exam.rankWE",
  "uzakyol-vardiya-zabiti": "exam.rankWO",
  "vardiya-zabiti": "exam.rankW",
  "stcw-temel": "exam.rankBasic",
};
const POOL_KEY: Record<string, string> = {
  "uzakyol-vardiya-zabiti": "exam.poolDeck",
  "makine-zabiti": "exam.poolEng",
  "stcw-temel": "exam.poolBasic",
};

// Display names only — slugs, URLs and answer keys always stay Turkish.
const RANK_EN: Record<string, string> = {
  "makine-zabiti": "Engineer Officer",
  "uzakyol-bas-muhendis": "Ocean-Going Chief Engineer",
  "uzakyol-i-zabiti": "Ocean-Going Chief Officer",
  "uzakyol-vardiya-muhendisi": "Ocean-Going Watch Engineer",
  "uzakyol-vardiya-zabiti": "Ocean-Going Watch Officer",
  "vardiya-zabiti": "Watch Officer",
  "stcw-temel": "STCW Basic Training",
};

// Merged pools: identical source content shown as one pool per department.
const POOL_TR: Record<string, string> = {
  "uzakyol-vardiya-zabiti": "Güverte Zabitleri",
  "makine-zabiti": "Makine Zabitleri",
  "stcw-temel": "STCW Temel",
};
const POOL_EN: Record<string, string> = {
  "uzakyol-vardiya-zabiti": "Deck Officers",
  "makine-zabiti": "Engine Officers",
  "stcw-temel": "STCW Basic Training",
};

const DERS_EN: Record<string, string> = {
  "Deniz Hukuku": "Maritime Law",
  "Denizcilik Ingilizcesi": "Maritime English",
  "Gemi Yardimci Makineleri": "Auxiliary Machinery",
  "Seyir": "Navigation",
  "Vardiya Standartlari": "Watchkeeping Standards",
  "Can Kurtarma Araclari": "Life-Saving Appliances",
  "Ileri Yangin": "Advanced Firefighting",
  "Kisisel Can Kurtarma": "Personal Survival",
  "Personel Guvenligi": "Personnel Safety",
};

function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  function pick(l: Lang) {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  }
  return (
    <div className="flex gap-1 rounded-full border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
      <button onClick={() => pick("tr")} className={`rounded-full px-3 py-1 text-xs font-black ${lang === "tr" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>🇹🇷 TR</button>
      <button onClick={() => pick("en")} className={`rounded-full px-3 py-1 text-xs font-black ${lang === "en" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-60 hover:opacity-100"}`}>🌍 EN</button>
    </div>
  );
}

type Cevaplar = Record<string, Record<number, number>>;

function loadCevaplar(): Cevaplar {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}") as Cevaplar;
  } catch {
    return {};
  }
}

function ExamsContent() {
  useDocTitle("exam.title");
  const params = useSearchParams();
  const { t } = useLocale();
  const [sel, setSel] = useState({ rank: "", ders: "", denemeNo: 0 });
  const { rank, ders, denemeNo } = sel;
  const meta = EXAM_RANKS.find((r) => r.slug === rank) ?? null;

  useEffect(() => {
    setSel({
      rank: params.get("rank") ?? "",
      ders: params.get("ders") ?? "",
      denemeNo: Number(params.get("deneme") ?? 0),
    });
  }, [params]);

  const [denemeler, setDenemeler] = useState<HavuzDeneme[] | null>(null);
  const [cevaplar, setCevaplar] = useState<Cevaplar>({});
  const [yuklendi, setYuklendi] = useState(false);
  const [hata, setHata] = useState("");
  const [lang, setLang] = useState<Lang>("tr");

  useEffect(() => {
    setCevaplar(loadCevaplar());
    setLang(loadLang());
  }, []);

  useEffect(() => {
    if (!meta) {
      setDenemeler(null);
      return;
    }
    setDenemeler(RANK_DATA[meta.slug] ?? null);
    setYuklendi(true);
  }, [meta?.slug]);

  function kaydet(key: string, next: Record<number, number>) {
    setCevaplar((prev) => {
      const out = { ...prev, [key]: next };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(out));
      } catch {
        /* ignore */
      }
      return out;
    });
  }

  // ---------- level 0: ranks ----------
  if (!meta) {
    // Identical source pools merged: one Deck + one Engine pool + STCW.
    const pools = ["uzakyol-vardiya-zabiti", "makine-zabiti", "stcw-temel"];
    const rankBySlug = (s: string) => EXAM_RANKS.find((r) => r.slug === s);
    const poolAd = (slug: string, ad: string) => {
      const key = POOL_KEY[slug] ?? RANK_KEY[slug];
      if (key) return t(key);
      return lang === "en" ? (POOL_EN[slug] ?? RANK_EN[slug] ?? ad) : (POOL_TR[slug] ?? ad);
    };
    const dersLine = (r: (typeof EXAM_RANKS)[number]) =>
      r.dersler.map((d) => `${lang === "en" ? (DERS_EN[d.ad] ?? d.ad) : d.ad} (${d.soru})`).join(" • ");
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{t("exam.title")}</h1>
            <p className="text-sm font-medium opacity-70">
              {t("exam.sub").replace("{n}", String(EXAM_TOPLAM_SORU)).replace("{m}", String(EXAM_TOPLAM_DENEME))}
            </p>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {pools.map((slug) => {
            const r = rankBySlug(slug);
            if (!r) return null;
            return (
              <Link
                key={r.slug}
                href={`/exams?rank=${r.slug}`}
                className="block rounded-2xl border border-amber-200 bg-white p-4 hover:shadow dark:border-red-950 dark:bg-neutral-950"
              >
                <div className="font-bold">{poolAd(r.slug, r.ad)}</div>
                <div className="mt-1 text-xs opacity-70">
                  {t("exam.cardLine").replace("{n}", String(r.deneme)).replace("{m}", String(r.soru))}
                </div>
                <div className="mt-2 text-xs font-bold opacity-70">
                  {dersLine(r)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (!yuklendi || !denemeler) {
    return (
      <div className="grid gap-4">
        <p className="text-sm opacity-70">{t("exam.loading")} (rank={rank || "-"} yuklendi={yuklendi ? "1" : "0"}{hata ? ` hata: ${hata}` : ""})</p>
        <Link href="/exams" className="text-sm font-bold underline">{t("exam.allBanks")}</Link>
      </div>
    );
  }

  const dersAdlari = [...new Set(denemeler.map((d) => d.ders))];

  // ---------- level 1: ders + deneme list ----------
  if (!ders) {
    return (
      <div className="grid gap-4">
        <div>
          <Link href="/exams" className="text-sm font-bold underline">{t("exam.allBanks")}</Link>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{POOL_KEY[meta.slug] ? t(POOL_KEY[meta.slug]) : meta.ad}</h1>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <p className="text-sm font-medium opacity-70">{t("exam.countLine").replace("{n}", String(meta.deneme)).replace("{m}", String(meta.soru))}{lang === "en" ? ` • ${t("exam.mtNote")}` : ""}</p>
        </div>
        {dersAdlari.map((d) => {
          const ds = denemeler.filter((x) => x.ders === d).sort((a, b) => a.deneme - b.deneme);
          return (
            <div key={d} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
              <h2 className="font-bold">{lang === "en" ? (DERS_EN[d] ?? d) : d} <span className="text-xs font-medium opacity-60">{t("exam.qCount").replace("{n}", String(ds.reduce((a, x) => a + x.sorular.length, 0)))}</span></h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {ds.map((x) => {
                  const key = `${meta.slug}/${d}/${x.deneme}`;
                  const ans = cevaplar[key] ?? {};
                  const cozulen = Object.keys(ans).length;
                  return (
                    <Link
                      key={x.deneme}
                      href={`/exams?rank=${meta.slug}&ders=${encodeURIComponent(d)}&deneme=${x.deneme}`}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold ${cozulen > 0 ? "border-green-600 bg-green-50 dark:bg-green-950" : "bg-white dark:bg-black"}`}
                      title={cozulen > 0 ? t("exam.solvedTitle").replace("{s}", String(cozulen)).replace("{t}", String(x.sorular.length)) : `${x.sorular.length} questions`}
                    >
                      {t("exam.testN").replace("{n}", String(x.deneme))}{cozulen > 0 ? ` (${cozulen}/${x.sorular.length})` : ""}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- level 2: quiz ----------
  const aktif = denemeler.find((x) => x.ders === ders && x.deneme === denemeNo) ?? null;
  if (!aktif) {
    return (
      <div className="grid gap-4">
        <p className="text-sm opacity-70">{t("exam.notFound")}</p>
        <Link href={`/exams?rank=${meta.slug}`} className="text-sm font-bold underline">← {POOL_KEY[meta.slug] ? t(POOL_KEY[meta.slug]) : meta.ad}</Link>
      </div>
    );
  }
  return <Quiz anahtar={`${meta.slug}/${ders}/${aktif.deneme}`} deneme={aktif} metaAd={meta.ad} cevaplar={cevaplar} kaydet={kaydet} lang={lang} setLang={setLang} enListe={RANK_EN_QA[meta.slug] ?? []} />;
}

function Quiz({ anahtar, deneme, metaAd, cevaplar, kaydet, lang, setLang, enListe }: {
  anahtar: string;
  deneme: HavuzDeneme;
  metaAd: string;
  cevaplar: Cevaplar;
  kaydet: (key: string, next: Record<number, number>) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  enListe: EnDeneme[];
}) {
  useDocTitle("exam.title");
  const ans = useMemo(() => cevaplar[anahtar] ?? {}, [cevaplar, anahtar]);
  const { t } = useLocale();
  const [slug, ders] = anahtar.split("/");
  const kardes = deneme.deneme;
  const rankAd = (() => {
    const key = POOL_KEY[slug] ?? RANK_KEY[slug];
    if (key) return t(key);
    return lang === "en" ? (POOL_EN[slug] ?? RANK_EN[slug] ?? metaAd) : (POOL_TR[slug] ?? metaAd);
  })();
  const dersAd = lang === "en" ? (DERS_EN[deneme.ders] ?? deneme.ders) : deneme.ders;
  const enDeneme = useMemo(
    () => enListe.find((d) => d.ders === deneme.ders && d.deneme === deneme.deneme) ?? null,
    [enListe, deneme.ders, deneme.deneme]
  );
  const enByNo = useMemo(() => {
    const m = new Map<number, EnSoru>();
    enDeneme?.sorular.forEach((q) => m.set(q.no, q));
    return m;
  }, [enDeneme]);
  const goster = (s: HavuzDeneme["sorular"][number]) => {
    if (lang === "tr") return { soru: s.soru, siklar: s.siklar };
    const en = enByNo.get(s.no);
    if (!en) return { soru: s.soru, siklar: s.siklar };
    return {
      soru: en.soru_en.trim() || s.soru,
      siklar: s.siklar.map((o, i) => (en.siklar_en[i] ?? "").trim() || o),
    };
  };

  let dogru = 0, yanlis = 0, bos = 0, anahtarsiz = 0;
  for (const s of deneme.sorular) {
    const secim = ans[s.no];
    if (s.cevap == null) {
      if (secim != null) anahtarsiz++;
      else bos++;
    } else if (secim == null) bos++;
    else if (secim === s.cevap) dogru++;
    else yanlis++;
  }
  const puanlanan = dogru + yanlis;
  const yuzde = puanlanan > 0 ? Math.round((dogru / puanlanan) * 100) : 0;

  function sec(no: number, i: number) {
    kaydet(anahtar, { ...ans, [no]: i });
  }
  function temizle() {
    if (!confirm(t("exam.clearConfirm"))) return;
    kaydet(anahtar, {});
  }

  return (
    <div className="grid gap-4">
      <div>
        <Link href={`/exams?rank=${slug}`} className="text-sm font-bold underline">← {rankAd}</Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{dersAd} — {t("exam.testN").replace("{n}", String(deneme.deneme))}</h1>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <p className="text-sm font-medium opacity-70">
          <a href={deneme.kaynak_url} target="_blank" rel="noreferrer" className="underline">{t("exam.source")}</a> {t("exam.srcQ").replace("{n}", String(deneme.sorular.length))}
        </p>
      </div>

      <div className="sticky top-16 z-30 rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="text-green-700">✓ {dogru}</span>
          <span className="text-red-600">✗ {yanlis}</span>
          <span className="opacity-60">{t("exam.blank").replace("{n}", String(bos))}</span>
          {anahtarsiz > 0 && <span className="text-amber-600">{t("exam.nokey").replace("{n}", String(anahtarsiz))}</span>}
          <span className="ml-auto">%{yuzde}</span>
          <button onClick={temizle} className="rounded-full border px-3 py-1 text-xs">{t("exam.clear")}</button>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-neutral-800">
          <div className="h-full bg-green-600" style={{ width: `${deneme.sorular.length ? Math.round(((dogru + yanlis + anahtarsiz) / deneme.sorular.length) * 100) : 0}%` }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {deneme.sorular.map((s) => {
            const a = ans[s.no];
            const cls = a == null ? "border" : s.cevap == null ? "border-amber-500 bg-amber-50 dark:bg-amber-950" : a === s.cevap ? "bg-green-600 text-white" : "bg-red-600 text-white";
            return (
              <a key={s.no} href={`#soru-${s.no}`} className={`rounded px-1.5 py-0.5 text-xs font-bold ${cls}`}>
                {s.no}
              </a>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3">
        {deneme.sorular.map((s) => {
          const secim = ans[s.no];
          const biliniyor = s.cevap != null;
          const disp = goster(s);
          return (
            <div key={s.no} id={`soru-${s.no}`} className="scroll-mt-32 rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
              <div className="flex items-start gap-2">
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-black text-amber-50 dark:bg-red-700 dark:text-white">{s.no}</span>
                <p className="flex-1 text-sm font-medium">{disp.soru}</p>
                {secim != null && (biliniyor ? (secim === s.cevap ? <span className="text-green-700">✓</span> : <span className="text-red-600">✗</span>) : <span className="text-amber-600">?</span>)}
              </div>
              {s.gorsel.length > 0 && (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs dark:bg-black">
                  {t("exam.imgMissing").replace("{f}", s.gorsel.join(", "))}
                </p>
              )}
              <div className="mt-2 grid gap-1.5">
                {disp.siklar.map((sik, i) => {
                  const n = i + 1;
                  let cls = "border bg-white dark:bg-black";
                  if (secim != null && biliniyor) {
                    if (n === s.cevap) cls = "border-green-600 bg-green-50 font-bold dark:bg-green-950";
                    else if (n === secim) cls = "border-red-600 bg-red-50 font-bold dark:bg-red-950";
                    else cls = "border opacity-60";
                  } else if (secim === n) {
                    cls = "border-amber-500 bg-amber-50 font-bold dark:bg-amber-950";
                  }
                  return (
                    <button
                      key={n}
                      onClick={() => sec(s.no, n)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm ${cls}`}
                    >
                      <span className="font-black">{HARFLER[i]}.</span>
                      <span>{sik}</span>
                    </button>
                  );
                })}
              </div>
              {secim != null && !biliniyor && (
                <p className="mt-2 text-xs font-bold text-amber-600">{t("exam.noKey")}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {kardes > 1 && (
          <Link href={`/exams?rank=${slug}&ders=${encodeURIComponent(ders)}&deneme=${kardes - 1}`} className="rounded-full border px-4 py-2 text-sm font-bold">
            {t("exam.prev").replace("{n}", String(kardes - 1))}
          </Link>
        )}
        <Link href={`/exams?rank=${slug}&ders=${encodeURIComponent(ders)}&deneme=${kardes + 1}`} className="rounded-full border px-4 py-2 text-sm font-bold">
          {t("exam.next").replace("{n}", String(kardes + 1))}
        </Link>
      </div>
    </div>
  );
}

export default function ExamsInner() {
  useDocTitle("exam.title");
  return <ExamsContent />;
}
