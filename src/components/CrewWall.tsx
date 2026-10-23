"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLocale } from "@/lib/i18n";
import { useProfile } from "@/hooks/useProfile";

interface CrewStory {
  id: string;
  author: string;
  title: string;
  body: string;
  port: string | null;
  photoUrl: string | null;
  created_at: string;
}

async function preparePhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error("photo");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.width || !image.height || image.width * image.height > 40_000_000) throw new Error("photo");
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("photo");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob || blob.size > 2 * 1024 * 1024) throw new Error("photo");
    return blob;
  } finally { URL.revokeObjectURL(url); }
}

export default function CrewWall() {
  const { t, locale } = useLocale();
  const profile = useProfile();
  const author = profile?.displayName?.trim().slice(0, 80) || t("news.anon");
  const headingId = useId();
  const [posts, setPosts] = useState<CrewStory[]>([]);
  const [configured, setConfigured] = useState(false);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({ port: "", body: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRequest = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setOnline(navigator.onLine);
      if (!navigator.onLine) return;
      try {
        // The existing offline worker caches every GET. This read-only POST bypasses it.
        const response = await fetch("/api/crew-wall?view=approved", { method: "POST", cache: "no-store", signal: controller.signal });
        if (!response.ok) { if (active) setConfigured(false); return; }
        const data = await response.json();
        if (active) { setConfigured(data.configured === true); setPosts(Array.isArray(data.posts) ? data.posts : []); }
      } catch { if (active) setConfigured(false); }
    }
    function offline() { setOnline(false); }
    void load();
    window.addEventListener("online", load);
    window.addEventListener("offline", offline);
    return () => { active = false; controller.abort(); photoRequest.current++; window.removeEventListener("online", load); window.removeEventListener("offline", offline); };
  }, []);

  useEffect(() => {
    if (!photo) { setPreview(null); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function choosePhoto(file?: File) {
    if (!file) return;
    const request = ++photoRequest.current;
    setPreparing(true); setMessage(""); setSent(false);
    try {
      const blob = await preparePhoto(file);
      if (request === photoRequest.current) setPhoto(blob);
    } catch { if (request === photoRequest.current) setMessage("news.photoFail"); }
    finally { if (request === photoRequest.current) setPreparing(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || preparing || !configured || !online) return;
    if (!form.body.trim() && !photo) { setMessage("news.needContent"); setSent(false); return; }
    const body = new FormData();
    body.set("author", author);
    body.set("title", t(photo ? "news.photoTitle" : "news.storyFall"));
    body.set("body", form.body.trim());
    body.set("port", form.port.trim());
    if (photo) body.set("photo", photo, "crew-photo.jpg");
    setBusy(true); setMessage(""); setSent(false);
    try {
      const response = await fetch("/api/crew-wall", { method: "POST", body });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setMessage(result.error === "photo" ? "news.photoFail" : response.status === 400 || response.status === 413 ? "news.needContent" : "contact.title");
        return;
      }
      setSent(true); setMessage("news.posted");
      setForm({ port: "", body: "" }); setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      // Pending submissions are deliberately never appended to the public wall.
    } catch { setMessage("contact.title"); }
    finally { setBusy(false); }
  }

  const input = "w-full min-w-0 rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm dark:border-red-900 dark:bg-black dark:text-red-200";
  return (
    <section aria-labelledby={headingId} className="shark-crew-wall grid gap-6">
      <h2 id={headingId} className="text-2xl font-semibold sm:text-3xl">{t("news.postTitle")}</h2>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="grid content-start gap-4 sm:grid-cols-2">
          {posts.length === 0 && <div className="shark-card flex min-h-48 items-center justify-center rounded-2xl border border-dashed p-6 text-center sm:col-span-2"><p className="text-sm opacity-70">{t("news.empty")}</p></div>}
          {posts.map(post => (
            <article key={post.id} className="shark-card overflow-hidden rounded-2xl border">
              {post.photoUrl && <img src={post.photoUrl} alt={post.title} loading="lazy" className="aspect-[4/3] w-full object-cover dark:brightness-75 dark:grayscale" />}
              <div className="grid gap-3 p-5">
                <h3 className="shark-card-title break-words text-lg font-semibold">{post.title}</h3>
                {post.body && <p className="shark-card-description whitespace-pre-wrap break-words text-sm leading-relaxed">{post.body}</p>}
                <div className="shark-quote-credit border-t pt-3 text-xs leading-relaxed"><span className="break-words font-semibold">{post.author}</span>{post.port && <span className="break-words"> · {post.port}</span>}<time dateTime={post.created_at} className="mt-1 block opacity-70">{new Date(post.created_at).toLocaleDateString(locale)}</time></div>
              </div>
            </article>
          ))}
        </div>
        <form onSubmit={submit} aria-label={t("news.postTitle")} className="shark-card grid content-start gap-4 rounded-2xl border p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-medium"><span>{t("news.namePh")}</span><input value={author} readOnly autoComplete="off" className={input} /></label>
            <label className="grid gap-2 text-xs font-medium"><span>{t("news.portPh")}</span><input value={form.port} onChange={e => setForm({ ...form, port: e.target.value })} maxLength={100} className={input} disabled={busy} /></label>
          </div>
          <label className="grid gap-2 text-xs font-medium"><span>{t("news.storyPh")}</span><textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} maxLength={2000} rows={4} className={input + " resize-y"} disabled={busy} /></label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label={t("news.addPhoto")} onChange={e => { void choosePhoto(e.target.files?.[0]); }} disabled={busy || preparing} />
          {preview && <div className="relative"><img src={preview} alt={t("news.previewAlt")} className="max-h-64 w-full rounded-xl object-contain dark:brightness-75 dark:grayscale" /><button type="button" onClick={() => { photoRequest.current++; setPhoto(null); setPreparing(false); if (fileRef.current) fileRef.current.value = ""; }} disabled={busy} className="mt-2 min-h-10 text-xs underline underline-offset-4">{t("news.remove")}</button></div>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || preparing} className="shark-chip min-h-11 rounded-full border px-4 py-2 text-sm font-medium disabled:opacity-40">{t(photo ? "news.changePhoto" : "news.addPhoto")}</button>
            <button type="submit" disabled={!configured || !online || busy || preparing} className="min-h-11 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-800 dark:text-red-100">{(busy || preparing) && <span aria-hidden="true">⏳ </span>}{t("news.post")}</button>
          </div>
          {message && <p role={sent ? "status" : "alert"} className="text-sm leading-relaxed">{sent && <span aria-hidden="true">⏳ </span>}{message === "contact.title" ? <><span aria-hidden="true">⚠️ </span><a href="/contact" className="underline underline-offset-4">{t(message)}</a></> : t(message)}</p>}
        </form>
      </div>
    </section>
  );
}
