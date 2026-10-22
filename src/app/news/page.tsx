"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { db, uid } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { NEWS, SECTIONS, type NewsPost, type NewsSection } from "@/lib/news";
import { useContentOverlay, cov, withOv } from "@/lib/i18n-content";
import type { CrewPost } from "@/lib/types";
import { useLocale } from "@/lib/i18n";

const LEGACY_KEY = "oa-crew-posts";
const MIGRATED_KEY = "oa-crew-migrated";

function sectionLabel(s: NewsSection, sections: typeof SECTIONS = SECTIONS): string {
  return sections.find((x) => x.id === s)?.label ?? s;
}

// Downscale to max 1080px JPEG so wall photos stay small on-device.
function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, 1080 / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        cv.getContext("2d")!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function NewsPage() {
  const [sec, setSec] = useState<"all" | NewsSection>("all");
  const { t } = useLocale();
  const o = useContentOverlay();
  const sectionsOv = SECTIONS.map((s) => withOv(s, cov(o, "sections", s.id)));
  const newsOv = NEWS.map((p) => withOv(p, cov(o, "news", p.id)));
  const crew = useLiveQuery(() => db.crewPosts.toArray(), []);
  const [form, setForm] = useState({ author: "", title: "", port: "", body: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // One-time import of pre-Dexie wall posts.
  useEffect(() => {
    try {
      if (localStorage.getItem(MIGRATED_KEY)) return;
      const raw = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
      if (Array.isArray(raw) && raw.length > 0) {
        const rows: CrewPost[] = raw
          .filter((p) => p && typeof p.id === "string" && typeof p.title === "string")
          .map((p) => ({
            id: String(p.id).startsWith("crew-") ? String(p.id) : `crew-${Date.now()}-${String(p.id)}`,
            author: typeof p.author === "string" && p.author ? p.author : t("news.anon"),
            title: String(p.title),
            text: Array.isArray(p.body) ? p.body.join("\n\n") : "",
            port: typeof p.port === "string" ? p.port : undefined,
            photo: null,
            date: typeof p.date === "string" ? p.date : new Date().toISOString().slice(0, 10),
            status: "approved" as const,
            createdAt: new Date().toISOString(),
          }));
        db.crewPosts.bulkAdd(rows).catch(() => { /* ignore dupes */ });
      }
      localStorage.setItem(MIGRATED_KEY, "1");
    } catch { /* ignore */ }
  }, []);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await compressPhoto(file));
    } catch {
      setMsg(t("news.photoFail"));
    }
  }

  async function submit() {
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title && !photo) { setMsg(t("news.needContent")); return; }
    const now = new Date();
    await db.crewPosts.add({
      id: uid("crew"),
      author: form.author.trim() || t("news.anon"),
      title: title || t("news.photoTitle"),
      text: body,
      port: form.port.trim() || undefined,
      photo,
      date: now.toISOString().slice(0, 10),
      status: "approved",
      createdAt: now.toISOString(),
    });
    setForm({ author: "", title: "", port: "", body: "" });
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
    setMsg(t("news.posted"));
  }

  async function remove(id: string) {
    if (!window.confirm(t("news.confirmDel"))) return;
    await db.crewPosts.delete(id);
  }

  const crewNews: NewsPost[] = (crew ?? []).map((c) => ({
    id: c.id,
    date: c.date,
    tag: "Crew",
    title: c.title,
    body: [c.text || "📷"],
    section: "crew" as const,
    author: c.author,
    ...(c.port ? { port: c.port } : {}),
  }));
  const photos = new Map((crew ?? []).map((c) => [c.id, c.photo ?? null]));
  const mine = new Set((crew ?? []).map((c) => c.id));
  const all = [...crewNews, ...newsOv].slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const shown = sec === "all" ? all : all.filter((p) => p.section === sec);
  const [featured, ...rest] = shown;
  const count = (s: NewsSection) => all.filter((p) => p.section === s).length;
  const inp = "rounded-xl border px-3 py-2 text-sm w-full";

  function CrewCard({ n, big }: { n: NewsPost; big?: boolean }) {
    const img = photos.get(n.id) ?? null;
    return (
      <div className={big
        ? "overflow-hidden rounded-3xl border-2 border-amber-300 bg-stone-900 text-amber-50 dark:border-red-800 dark:bg-black"
        : "overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950"}>
        {img && (
          <Link href={`/news/${n.id}`}>
            <img src={img} alt={n.title} className="aspect-square w-full object-cover" />
          </Link>
        )}
        <div className={big ? "p-5" : "p-4"}>
          <Link href={`/news/${n.id}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-bold ${big ? "bg-amber-400 text-stone-950" : "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white"}`}>{sectionLabel(n.section, sectionsOv)}</span>
              <span className="opacity-60">{n.date}</span>
              {n.port && <span className="opacity-60">📍 {n.port}</span>}
            </div>
            <div className={`${big ? "mt-2 text-2xl" : "mt-1 text-lg"} font-black`}>{n.title}</div>
            {n.body[0] !== "📷" && <div className="mt-1 text-sm opacity-70">{n.body[0].slice(0, big ? 160 : 140)}…</div>}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold">
            <span className="flex-1 opacity-70">👤 {n.author ?? t("news.anon")}</span>
            {mine.has(n.id) && (
              <button onClick={() => remove(n.id)} className="rounded-full border px-3 py-1 opacity-70">{t("common.delete")}</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("news.title")}</h1>
        <p className="text-sm font-medium opacity-70">{t("news.sub")}</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
        <button onClick={() => setSec("all")} className={`min-w-20 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${sec === "all" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{t("news.allN").replace("{n}", String(all.length))}</button>
        {sectionsOv.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)} title={s.blurb} className={`min-w-20 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${sec === s.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{s.label} ({count(s.id)})</button>
        ))}
      </div>

      {(sec === "all" || sec === "crew") && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-black">{t("news.postTitle")}</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder={t("news.namePh")} className={inp} />
            <input value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder={t("news.portPh")} className={inp} />
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("news.titlePh")} className={`${inp} mt-2`} />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={2} placeholder={t("news.storyPh")} className={`${inp} mt-2`} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-full border px-4 py-2 text-sm font-bold">
              📷 {photo ? t("news.changePhoto") : t("news.addPhoto")}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
            {photo && (
              <>
                <img src={photo} alt={t("news.previewAlt")} className="h-12 w-12 rounded-xl object-cover ring-1 ring-amber-200" />
                <button onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs font-bold opacity-60">{t("news.remove")}</button>
              </>
            )}
            <button onClick={submit} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("news.post")}</button>
            {msg && <span className="text-xs font-bold opacity-70">{msg}</span>}
          </div>
        </div>
      )}

      {featured && (
        mine.has(featured.id) || photos.get(featured.id) ? <CrewCard n={featured} big /> : (
          <Link href={`/news/${featured.id}`} className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50 hover:shadow dark:border-red-800 dark:bg-black">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-amber-400 px-2 py-0.5 font-bold text-stone-950">{sectionLabel(featured.section, sectionsOv)}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 font-bold">{featured.tag}</span>
              <span className="opacity-60">{featured.date}</span>
            </div>
            <div className="mt-2 text-2xl font-black">{featured.title}</div>
            {featured.visual === "fishmap" && <div className="mt-1 text-xs font-black opacity-70">{t("news.fishmap")}</div>}
            <div className="mt-1 text-sm opacity-80">{featured.body[0].slice(0, 160)}…</div>
            {(featured.author || featured.port) && (
              <div className="mt-2 text-xs font-bold opacity-70">{featured.author ?? ""}{featured.author && featured.port ? " • " : ""}{featured.port ?? ""}</div>
            )}
          </Link>
        )
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {rest.map((n) => (
          mine.has(n.id) || photos.get(n.id) ? <CrewCard key={n.id} n={n} /> : (
            <div key={n.id} className="rounded-2xl border border-amber-200 bg-white p-4 hover:shadow dark:border-red-950 dark:bg-neutral-950">
              <Link href={`/news/${n.id}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{sectionLabel(n.section, sectionsOv)}</span>
                  <span className="rounded-full border px-2 py-0.5 font-bold opacity-70">{n.tag}</span>
                  <span className="opacity-60">{n.date}</span>
                </div>
                <div className="mt-1 text-lg font-black">{n.title}</div>
                {n.visual === "fishmap" && <div className="mt-1 text-xs font-black opacity-70">{t("news.fishmap")}</div>}
                <div className="text-sm opacity-70">{n.body[0].slice(0, 140)}…</div>
                {(n.author || n.port) && (
                  <div className="mt-1 text-xs font-bold opacity-60">{n.author ?? ""}{n.author && n.port ? " • " : ""}{n.port ?? ""}</div>
                )}
              </Link>
            </div>
          )
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm opacity-60">{t("news.empty")}</p>}
    </div>
  );
}
