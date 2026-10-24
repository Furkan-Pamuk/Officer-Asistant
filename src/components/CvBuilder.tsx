"use client";
import { useEffect, useState } from "react";
import { db, uid } from "@/lib/db";
import { CERTS, CERT_CATS, LANGS, LEVELS, CV_TEMPLATES, MOTIVATION_DRAFT } from "@/lib/certs";
import { contractDays, fmtService } from "@/components/ServiceBoard";
import type { Contract, CvData, CvLang, CvRef, Profile } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

function blankCv(): CvData {
  return { id: "me", template: "classic", contact: { email: "", phone: "", nationality: "", dob: "" }, certs: {}, motivation: MOTIVATION_DRAFT, refs: [], langs: [], updatedAt: "" };
}

export default function CvBuilder() {
  const { t } = useLocale();
  const [cv, setCv] = useState<CvData>(blankCv());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [langQ, setLangQ] = useState("");
  const [langLevel, setLangLevel] = useState("B2");
  const [ref, setRef] = useState({ name: "", email: "", phone: "", position: "", workplace: "" });
  const [certQ, setCertQ] = useState("");
  const [service, setService] = useState<{ c: Contract; days: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, p, list] = await Promise.all([db.cvdata.get("me"), db.profile.get("me"), db.contracts.toArray()]);
      if (c) setCv({ ...blankCv(), ...c });
      setProfile(p ?? null);
      const sorted = list.slice().sort((a, b) => a.signOnDate.localeCompare(b.signOnDate));
      setService(sorted.map((x) => ({ c: x, days: contractDays(x, new Date()) ?? 0 })).filter((x) => x.days > 0));
      setLoaded(true);
    })();
  }, []);

  async function persist(next: CvData) {
    setCv(next);
    await db.cvdata.put({ ...next, updatedAt: new Date().toISOString() });
  }

  const selCerts = CERTS.filter((c) => cv.certs[c.id]?.on);
  const filteredCerts = CERTS.filter((c) => c.name.toLowerCase().includes(certQ.trim().toLowerCase()));
  const langHits = LANGS.filter((l) => l.toLowerCase().includes(langQ.trim().toLowerCase()) && !cv.langs.some((x) => x.lang === l)).slice(0, 8);

  function toggleCert(id: string) {
    const cur = cv.certs[id] ?? { on: false, expiry: "" };
    persist({ ...cv, certs: { ...cv.certs, [id]: { ...cur, on: !cur.on } } });
  }
  function certExpiry(id: string, expiry: string) {
    const cur = cv.certs[id] ?? { on: true, expiry: "" };
    persist({ ...cv, certs: { ...cv.certs, [id]: { ...cur, expiry } } });
  }

  function addRef() {
    if (!ref.name.trim()) return;
    persist({ ...cv, refs: [...cv.refs, { ...ref, id: uid("ref") }] });
    setRef({ name: "", email: "", phone: "", position: "", workplace: "" });
  }
  function addLang(lang: string) {
    persist({ ...cv, langs: [...cv.langs, { lang, level: langLevel }] });
    setLangQ("");
  }

  if (!loaded) return <p>{t("cv.loading")}</p>;

  const box = "rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950 print:hidden";
  const inp = "rounded-xl border px-2 py-1.5 text-sm w-full";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("profile.tabCv")}</h1>
          <p className="text-sm opacity-70">{t("cv.hint")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">🖨️ Print</button>
          <button onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); alert(t("cv.copied")); } catch {} }} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">{t("cv.copyLink")}</button>
        </div>
      </div>

      <div className={box}>
        <h2 className="font-black">1 • Template ({CV_TEMPLATES.length})</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {CV_TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => persist({ ...cv, template: t.id })} className={`rounded-xl border p-2.5 text-left ${cv.template === t.id ? "border-stone-900 ring-2 ring-amber-400 dark:border-red-500" : "border-amber-200 dark:border-red-950"}`}>
              <div className="font-black">{t.name}</div>
              <div className="text-xs opacity-60">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={box}>
        <h2 className="font-black">2 • Contact</h2>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <input value={cv.contact.email} onChange={(e) => persist({ ...cv, contact: { ...cv.contact, email: e.target.value } })} placeholder={t("contact.email")} className={inp} />
          <input value={cv.contact.phone} onChange={(e) => persist({ ...cv, contact: { ...cv.contact, phone: e.target.value } })} placeholder={t("cv.phone")} className={inp} />
          <input value={cv.contact.nationality} onChange={(e) => persist({ ...cv, contact: { ...cv.contact, nationality: e.target.value } })} placeholder={t("cv.nat")} className={inp} />
          <input value={cv.contact.dob} onChange={(e) => persist({ ...cv, contact: { ...cv.contact, dob: e.target.value } })} placeholder={t("cv.dob")} className={inp} />
        </div>
        <p className="mt-1 text-xs opacity-60">{t("cv.photoHint")}</p>
      </div>

      <div className={box}>
        <div className="flex items-center gap-2">
          <h2 className="font-black">3 • Certificates ({selCerts.length} selected)</h2>
          <input value={certQ} onChange={(e) => setCertQ(e.target.value)} placeholder={t("cv.search")} className="ml-auto w-40 rounded-xl border px-2 py-1 text-xs" />
        </div>
        {CERT_CATS.map((cat) => {
          const items = filteredCerts.filter((c) => c.cat === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mt-2">
              <div className="text-xs font-black uppercase tracking-widest opacity-60">{cat}</div>
              <div className="mt-1 grid gap-1">
                {items.map((c) => {
                  const sel = cv.certs[c.id];
                  return (
                    <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/60 px-2 py-1.5 text-sm dark:bg-black dark:ring-1 dark:ring-red-950">
                      <button onClick={() => toggleCert(c.id)} aria-label={`${c.name} on/off`} className={`relative h-5 w-9 shrink-0 rounded-full ${sel?.on ? "bg-emerald-500" : "bg-stone-300 dark:bg-neutral-700"}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${sel?.on ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                      <span className="flex-1 font-medium">{c.name}</span>
                      {sel?.on && <input type="month" value={sel.expiry} onChange={(e) => certExpiry(c.id, e.target.value)} title={t("cv.expiry")} className="rounded-lg border px-1.5 py-0.5 text-xs" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className={box}>
        <h2 className="font-black">4 • Motivation letter</h2>
        <textarea value={cv.motivation} onChange={(e) => persist({ ...cv, motivation: e.target.value })} rows={8} className="mt-2 w-full rounded-xl border px-3 py-2 font-serif text-sm leading-relaxed" />
        <button onClick={() => persist({ ...cv, motivation: MOTIVATION_DRAFT.replace("[RANK]", profile?.rank ?? "Officer").replace("[NAME]", profile?.displayName ?? "") })} className="mt-1 rounded-full border px-3 py-1 text-xs font-bold">{t("cv.restore")}</button>
      </div>

      <div className={box}>
        <h2 className="font-black">5 • References ({cv.refs.length})</h2>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <input value={ref.name} onChange={(e) => setRef({ ...ref, name: e.target.value })} placeholder={t("cv.nameReq")} className={inp} />
          <input value={ref.position} onChange={(e) => setRef({ ...ref, position: e.target.value })} placeholder={t("cv.position")} className={inp} />
          <input value={ref.workplace} onChange={(e) => setRef({ ...ref, workplace: e.target.value })} placeholder={t("cv.workplace")} className={inp} />
          <input value={ref.email} onChange={(e) => setRef({ ...ref, email: e.target.value })} placeholder="Email" className={inp} />
          <input value={ref.phone} onChange={(e) => setRef({ ...ref, phone: e.target.value })} placeholder={t("cv.phone")} className={inp} />
        </div>
        <button onClick={addRef} className="mt-2 rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("cv.addRef")}</button>
        <ul className="mt-2 grid gap-1 text-sm">
          {cv.refs.map((r: CvRef) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/60 px-2 py-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">
              <strong className="flex-1">{r.name} <span className="font-normal opacity-60">— {r.position}{r.workplace ? `, ${r.workplace}` : ""}</span></strong>
              <span className="text-xs opacity-70">{[r.email, r.phone].filter(Boolean).join(" • ")}</span>
              <button onClick={() => persist({ ...cv, refs: cv.refs.filter((x) => x.id !== r.id) })} className="text-xs font-bold text-red-600">✕</button>
            </li>
          ))}
        </ul>
      </div>

      <div className={box}>
        <h2 className="font-black">6 • Languages</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <input value={langQ} onChange={(e) => setLangQ(e.target.value)} placeholder={t("cv.searchLang")} className="min-w-40 flex-1 rounded-xl border px-3 py-1.5" />
          <select value={langLevel} onChange={(e) => setLangLevel(e.target.value)} className="rounded-xl border px-2 py-1.5">
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        {langQ.trim().length > 0 && (
          <div className="mt-1 grid gap-1">
            {langHits.map((l) => (
              <button key={l} onClick={() => addLang(l)} className="rounded-xl border px-3 py-1.5 text-left text-sm font-bold hover:bg-amber-50 dark:hover:bg-red-950">+ {l} ({langLevel})</button>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cv.langs.map((l: CvLang, i: number) => (
            <span key={i} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold dark:bg-red-950">
              {l.lang} • {l.level} <button onClick={() => persist({ ...cv, langs: cv.langs.filter((_, j) => j !== i) })} className="ml-1 text-red-600">✕</button>
            </span>
          ))}
        </div>
      </div>

      <CvPreview cv={cv} profile={profile} service={service} selCerts={selCerts.map((c) => ({ ...c, expiry: cv.certs[c.id]?.expiry ?? "" }))} />
    </div>
  );
}

function CvPreview({ cv, profile, service, selCerts }: {
  cv: CvData; profile: Profile | null;
  service: { c: Contract; days: number }[];
  selCerts: { id: string; name: string; expiry: string }[];
}) {
  const { t } = useLocale();
  const name = profile?.displayName || "Your Name";
  const rank = profile?.rank || "Officer";
  const totalDays = service.reduce((a, s) => a + s.days, 0);
  const tpl = cv.template;

  const headCls =
    tpl === "maritime" ? "bg-[#1b2a4a] text-[#faf5e9]"
    : tpl === "minimal" ? "bg-white text-stone-900 border-b-2 border-stone-900"
    : tpl === "compact" ? "bg-stone-800 text-amber-50"
    : "bg-[#1b2a4a] text-[#faf5e9]";

  const secTitle = (s: string) => (
    <h3 className={`mt-4 border-b font-black uppercase tracking-widest ${tpl === "minimal" ? "border-stone-300 text-xs" : "text-sm"} ${tpl === "modern" ? "border-[#8b5a2b] text-[#8b5a2b]" : "border-amber-300"}`}>{s}</h3>
  );

  const body = (
    <>
      <div className={`flex items-center gap-4 rounded-t-2xl p-5 ${headCls}`}>
        {profile?.photoDataUrl && <img src={profile.photoDataUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-white/50" />}
        <div>
          <div className="font-display text-3xl font-black">{name}</div>
          <div className="font-bold opacity-80">{rank}</div>
          <div className="mt-1 text-xs opacity-70">{[cv.contact.email, cv.contact.phone, cv.contact.nationality].filter(Boolean).join(" • ")}</div>
        </div>
      </div>
      <div className={`p-5 text-sm ${tpl === "modern" ? "grid gap-4 md:grid-cols-[1fr_220px]" : ""}`}>
        <div>
          {secTitle("Sea service")}
          <ul className="mt-1 grid gap-1">
            {service.slice().reverse().map(({ c, days }) => (
              <li key={c.id}>• <strong>{c.shipName}</strong> ({c.shipType}) — {c.rank}, {c.company || "—"}: {c.signOnDate} → {c.signOffDate || "present"} ({fmtService(days)})</li>
            ))}
            {service.length === 0 && <li className="opacity-60">No contracts yet.</li>}
          </ul>
          <div className="mt-1 text-xs font-bold opacity-70">Total: {fmtService(totalDays)} ({totalDays} days)</div>

          {secTitle("Certificates")}
          <ul className="mt-1 grid gap-0.5 sm:grid-cols-2">
            {selCerts.map((c) => <li key={c.id}>• {c.name}{c.expiry ? ` (exp ${c.expiry})` : ""}</li>)}
            {selCerts.length === 0 && <li className="opacity-60">None selected.</li>}
          </ul>

          {secTitle("Languages")}
          <p className="mt-1">{cv.langs.length ? cv.langs.map((l) => `${l.lang} (${l.level})`).join(" • ") : <span className="opacity-60">—</span>}</p>

          {secTitle("References")}
          <ul className="mt-1 grid gap-1">
            {cv.refs.map((r) => <li key={r.id}>• <strong>{r.name}</strong> — {r.position}{r.workplace ? `, ${r.workplace}` : ""} ({[r.email, r.phone].filter(Boolean).join(" / ")})</li>)}
            {cv.refs.length === 0 && <li className="opacity-60">References available on request.</li>}
          </ul>
        </div>
        {tpl === "modern" && (
          <aside className="rounded-xl bg-[#8b5a2b]/10 p-3 text-xs">
            <div className="font-black uppercase">Snapshot</div>
            <div className="mt-1">{t("ctr.rank")} {rank}</div>
            <div>Sea time: {fmtService(totalDays)}</div>
            <div>Certs: {selCerts.length}</div>
            <div>Vessels: {service.length}</div>
          </aside>
        )}
      </div>
      <div className="rounded-b-2xl border-t border-amber-200 bg-amber-50/60 p-5 dark:border-red-950 dark:bg-black">
        <h3 className="font-black uppercase tracking-widest text-sm">Motivation letter</h3>
        <p className="mt-1 whitespace-pre-wrap font-serif leading-relaxed">{cv.motivation.replace("[RANK]", rank).replace("[NAME]", name)}</p>
      </div>
    </>
  );

  return (
    <div>
      <h2 className="mb-2 font-black print:hidden">{t("cv.preview").replace("{x}", CV_TEMPLATES.find((x) => x.id === tpl)?.name ?? "")}</h2>
      <div className={`overflow-hidden rounded-2xl border bg-white text-stone-900 shadow ${tpl === "compact" ? "text-[13px] leading-snug" : ""}`}>{body}</div>
    </div>
  );
}
