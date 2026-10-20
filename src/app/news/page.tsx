"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { NEWS, SECTIONS, type NewsPost, type NewsSection } from "@/lib/news";

const CREW_KEY = "oa-crew-posts";

function loadCrew(): NewsPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CREW_KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (p): p is NewsPost =>
        p && typeof p.id === "string" && typeof p.title === "string" && Array.isArray(p.body)
    );
  } catch {
    return [];
  }
}

function sectionLabel(s: NewsSection): string {
  return SECTIONS.find((x) => x.id === s)?.label ?? s;
}

export default function NewsPage() {
  const [sec, setSec] = useState<"all" | NewsSection>("all");
  const [crew, setCrew] = useState<NewsPost[]>([]);
  const [form, setForm] = useState({ author: "", title: "", port: "", body: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { setCrew(loadCrew()); }, []);

  function persist(next: NewsPost[]) {
    setCrew(next);
    try { localStorage.setItem(CREW_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function submit() {
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title || !body) { setMsg("Title and story are required."); return; }
    const post: NewsPost = {
      id: `crew-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      tag: "Crew",
      title,
      body: [body],
      section: "crew",
      author: form.author.trim() || "Anonymous",
      ...(form.port.trim() ? { port: form.port.trim() } : {}),
    };
    persist([post, ...crew]);
    setForm({ author: "", title: "", port: "", body: "" });
    setMsg("Posted to Sizden Gelenler.");
  }

  function remove(id: string) {
    if (!window.confirm("Delete this story from this device?")) return;
    persist(crew.filter((p) => p.id !== id));
  }

  const all = [...crew, ...NEWS].slice().sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const shown = sec === "all" ? all : all.filter((p) => p.section === sec);
  const [featured, ...rest] = shown;
  const count = (s: NewsSection) => all.filter((p) => p.section === s).length;
  const inp = "rounded-xl border px-3 py-2 text-sm w-full";

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">NEWS & Blog 📰</h1>
        <p className="text-sm font-medium opacity-70">Maritime news, crew stories, blogs and port-city guides.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-2xl border border-amber-200 bg-white p-1 dark:border-red-950 dark:bg-neutral-950">
        <button onClick={() => setSec("all")} className={`min-w-20 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${sec === "all" ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>All ({all.length})</button>
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)} title={s.blurb} className={`min-w-20 flex-1 rounded-full px-3 py-1.5 text-sm font-bold ${sec === s.id ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white" : "opacity-70 hover:opacity-100"}`}>{s.label} ({count(s.id)})</button>
        ))}
      </div>

      {(sec === "all" || sec === "crew") && (
        <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <h2 className="font-black">💬 Sizden Gelenler — post your story</h2>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Nickname / rank (e.g. 2nd Officer)" className={inp} />
            <input value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder="Port (optional)" className={inp} />
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className={`${inp} mt-2`} />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} placeholder="Your story…" className={`${inp} mt-2`} />
          <div className="mt-2 flex items-center gap-2">
            <button onClick={submit} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Post story</button>
            {msg && <span className="text-xs font-bold opacity-70">{msg}</span>}
          </div>
        </div>
      )}

      {featured && (
        <Link href={`/news/${featured.id}`} className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50 hover:shadow dark:border-red-800 dark:bg-black">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-amber-400 px-2 py-0.5 font-bold text-stone-950">{sectionLabel(featured.section)}</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 font-bold">{featured.tag}</span>
            <span className="opacity-60">{featured.date}</span>
          </div>
          <div className="mt-2 text-2xl font-black">{featured.title}</div>
          <div className="mt-1 text-sm opacity-80">{featured.body[0].slice(0, 160)}…</div>
          {(featured.author || featured.port) && (
            <div className="mt-2 text-xs font-bold opacity-70">{featured.author ?? ""}{featured.author && featured.port ? " • " : ""}{featured.port ?? ""}</div>
          )}
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {rest.map((n) => (
          <div key={n.id} className="rounded-2xl border border-amber-200 bg-white p-4 hover:shadow dark:border-red-950 dark:bg-neutral-950">
            <Link href={`/news/${n.id}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{sectionLabel(n.section)}</span>
                <span className="rounded-full border px-2 py-0.5 font-bold opacity-70">{n.tag}</span>
                <span className="opacity-60">{n.date}</span>
              </div>
              <div className="mt-1 text-lg font-black">{n.title}</div>
              <div className="text-sm opacity-70">{n.body[0].slice(0, 140)}…</div>
              {(n.author || n.port) && (
                <div className="mt-1 text-xs font-bold opacity-60">{n.author ?? ""}{n.author && n.port ? " • " : ""}{n.port ?? ""}</div>
              )}
            </Link>
            {n.id.startsWith("crew-") && (
              <button onClick={() => remove(n.id)} className="mt-2 rounded-full border px-3 py-1 text-xs font-bold opacity-70">Delete</button>
            )}
          </div>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm opacity-60">Nothing here yet.</p>}
    </div>
  );
}
