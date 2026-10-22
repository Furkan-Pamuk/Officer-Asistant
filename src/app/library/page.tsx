"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIBRARY_BOOKS } from "@/lib/data";
import { KNOTS } from "@/lib/navigation-documents";
import { KnotStepFigures } from "@/components/KnotDiagrams";
import HraMap from "@/components/HraMap";
import SarMap from "@/components/SarMap";
import FirstAidGuide from "@/components/FirstAidGuide";
import { useLocale } from "@/lib/i18n";
import { useDocTitle } from "@/lib/doctitle";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";

type Tab = "pub" | "books" | "knots" | "hra" | "sar" | "aid";

const DOC_TABS: { tab: string; label: string; desc: string }[] = [
  { tab: "orders", label: "📜 Orders", desc: "Master's standing orders + signature block." },
  { tab: "cards", label: "🆘 Cards", desc: "Emergency check cards with tickable steps." },
  { tab: "lights", label: "💡 Buoys", desc: "IALA buoyage, rhythms and light characters." },
  { tab: "symbols", label: "🧭 Symbols", desc: "Chart symbols, paper + ECDIS." },
  { tab: "weather", label: "⛅ Weather", desc: "Clouds, Beaufort, fronts and sea state." },
  { tab: "signals", label: "🚩 Signals", desc: "Phonetic alphabet + signal flags." },
  { tab: "morse", label: "📻 Morse", desc: "Morse code + procedure signs." },
  { tab: "colreg", label: "⚖️ COLREG", desc: "Rules of the road, lights, sounds, distress." },
];

export default function Library() {
  useDocTitle("nav.library");
  const { t } = useLocale();
  const o = useContentOverlay();
  const router = useRouter();
  const docLabel = (tab: string): string =>
    tab === "orders" ? t("lib.orders")
    : tab === "cards" ? t("lib.cards")
    : tab === "lights" ? t("lib.buoys")
    : tab === "symbols" ? t("lib.symbols")
    : tab === "weather" ? t("lib.weather")
    : tab === "signals" ? t("lib.signals")
    : tab === "morse" ? t("lib.morse")
    : t("lib.colreg");
  const [tab, setTab] = useState<Tab>("pub");
  // Tab from URL, read client-side so nothing suspends during render.
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (t === "pub" || t === "books" || t === "knots" || t === "hra" || t === "sar" || t === "aid") setTab(t);
    } catch { /* ignore */ }
  }, []);
  function pick(t: Tab) {
    setTab(t);
    router.replace(t === "pub" ? "/library" : `/library?tab=${t}`, { scroll: false });
  }
  function goDoc(tab: string) {
    router.push(tab === "orders" ? "/documents" : `/documents?tab=${tab}`);
  }
  const books = LIBRARY_BOOKS.map((b) => withOv(b, cov(o, "books", b.id)));
  const knots = KNOTS.map((k) => withOv(k, cov(o, "knots", k.id)));
  const btn = (t: Tab, label: string) =>
    `min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${tab === t ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`;
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("lib.title")}</h1>
        <p className="text-sm text-slate-600">{t("lib.sub")}</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
        <button onClick={() => pick("pub")} className={btn("pub", "📚 Publications")}>{t("lib.pubs").replace("{n}", String(LIBRARY_BOOKS.length))}</button>
        <button onClick={() => pick("books")} className={btn("books", "📕 Books")}>{t("lib.books").replace("{n}", String(LIBRARY_BOOKS.length))}</button>
        <button onClick={() => pick("knots")} className={btn("knots", "🪢 Knots")}>{t("lib.knots").replace("{n}", String(KNOTS.length))}</button>
        <button onClick={() => pick("hra")} className={btn("hra", "🗺️ HRA Map")}>{t("lib.hra")}</button>
        <button onClick={() => pick("sar")} className={btn("sar", "🛰️ SAR Map")}>{t("lib.sar")}</button>
        <button onClick={() => pick("aid")} className={btn("aid", "🩹 First Aid")}>{t("lib.firstaid")}</button>
        {DOC_TABS.map((d) => (
          <button key={d.tab} onClick={() => goDoc(d.tab)} className="min-w-24 flex-1 rounded-full px-3 py-1.5 text-sm font-bold opacity-70 hover:opacity-100">{docLabel(d.tab)}</button>
        ))}
      </div>
      {tab === "pub" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {books.map((b) => (
            <div key={b.id} className="rounded-2xl border bg-white p-4">
              <div className="text-xs font-bold text-sky-700">{b.abbr}</div>
              <h2 className="font-semibold">{b.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{b.description}</p>
              <p className="mt-1 text-xs text-slate-500">{t("lib.usedFor").replace("{x}", b.inspections.join(", "))}</p>
              <a href={b.link} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">{t("lib.openSrc")}</a>
            </div>
          ))}
        </div>
      ) : tab === "hra" ? (
        <div className="grid gap-4">
          <HraMap />
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:bg-black">
              <h2 className="font-bold text-red-800 dark:text-red-300">{t("lib.woa")}</h2>
              <ul className="mt-1 list-disc pl-5 text-sm">
                <li>Right to refuse sailing + repatriation at company cost + 2 months&apos; basic wage.</li>
                <li>Must be informed at assignment (or immediately if known at sea); declining costs you nothing.</li>
                <li>Bonus 100% of daily basic wage for the stay — minimum 5 days.</li>
                <li>Double compensation for death/disability.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:bg-black">
              <h2 className="font-bold text-amber-800">{t("lib.hra2")}</h2>
              <ul className="mt-1 list-disc pl-5 text-sm">
                <li>Same rights as WOA — except the bonus covers only the actual stay/transit duration.</li>
              </ul>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <h2 className="font-bold">{t("lib.erz")}</h2>
              <ul className="mt-1 list-disc pl-5 text-sm">
                <li>100% basic-wage bonus only for the day the vessel is attacked.</li>
                <li>Doubled compensation only if death/disability happens that day.</li>
                <li>No right to refuse sailing in this zone.</li>
              </ul>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold">{t("lib.ibf")}</h2>
            <p className="mt-1 text-sm text-slate-600">Israel &amp; Lebanon coastline · Strait of Hormuz · Black Sea · Masamirit–Bab el-Mandeb · Jazirat at Ta&apos;ir–Bab el-Mandeb · Bab el-Mandeb &amp; Golfe de Tadjoura · Bab el-Mandeb–Aden Harbour · Gulf of Aden &amp; Approaches · Western Indian Ocean · Lagos approaches · West Africa chart incl. Gulf of Guinea · Luanda–Baía dos Tigres · Greenville–Sassandra. Designations must be annexed to your CBA and available on board.</p>
          </div>
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-bold">{t("lib.bmp")}</h2>
            <ul className="mt-1 list-disc pl-5 text-sm">
              <li>Entering the VRA: send UKMTO initial report, then follow the Voluntary Reporting Scheme.</li>
              <li>BMP Maritime Security: voyage risk assessment, ship hardening, citadel readiness, extra watches.</li>
              <li>Captivity from piracy/hijacking keeps your employment protection — inside or outside designated areas.</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="https://www.itfseafarers.org/en/resources/itf-warlike-and-high-risk-areas" target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">ITF benefits ↗</a>
              <a href="https://imec.org.uk/the-international-bargaining-forum-ibf/ibf-risk-areas" target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">IBF area list ↗</a>
              <a href="https://www.ukmto.org/" target="_blank" rel="noreferrer" className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">UKMTO ↗</a>
            </div>
          </div>
        </div>
      ) : tab === "sar" ? (
        <SarMap />
      ) : tab === "aid" ? (
        <FirstAidGuide />
      ) : tab === "knots" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {knots.map((k) => (
            <div key={k.id} className="rounded-2xl border bg-white p-4">
              <h2 className="font-semibold">{k.name}{k.tr ? <span className="ml-2 text-sm font-normal opacity-60">({k.tr})</span> : null}</h2>
              <p className="mt-1 text-sm text-slate-600">{k.uses}</p>
              {k.warning && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">⚠️ {k.warning}</p>}
              <KnotStepFigures id={k.id} steps={k.steps} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {books.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3">
              <div className="flex-1">
                <span className="text-xs font-bold text-sky-700">{b.abbr}</span>
                <h2 className="text-sm font-semibold">{b.title}</h2>
              </div>
              <a href={b.link} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">{t("lib.open")}</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
