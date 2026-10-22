"use client";
import { use } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import { NEWS, SECTIONS, type NewsPost } from "@/lib/news";
import FishMap from "@/components/FishMap";
import { useLocale } from "@/lib/i18n";

const LEGACY_KEY = "oa-crew-posts";

function legacyPost(id: string, t: (key: string) => string): NewsPost | undefined {
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "[]");
    if (!Array.isArray(raw)) return undefined;
    const p = raw.find((x) => x?.id === id);
    if (!p) return undefined;
    return {
      id: p.id,
      date: typeof p.date === "string" ? p.date : "",
      tag: "Crew",
      title: typeof p.title === "string" ? p.title : t("news.storyFall"),
      body: Array.isArray(p.body) ? p.body : [],
      section: "crew",
      author: typeof p.author === "string" ? p.author : undefined,
      port: typeof p.port === "string" ? p.port : undefined,
    };
  } catch {
    return undefined;
  }
}

async function sharePost(post: NewsPost, photo: string | null | undefined, t: (key: string) => string) {
  const text = `${post.title}\n\n${post.body.join("\n\n")}\n\n— via Shark`;
  if (photo) {
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], "shark-crew.jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: post.title, text });
        return;
      }
    } catch { /* fall through to text share */ }
  }
  try {
    if (navigator.share) {
      await navigator.share({ title: post.title, text });
      return;
    }
    throw 0;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      alert(t("news.copied"));
    } catch {
      alert(t("common.noShare"));
    }
  }
}

export default function NewsPostClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLocale();
  const crew = useLiveQuery(() => db.crewPosts.where("id").equals(id).toArray(), [id]);
  const seed = NEWS.find((n) => n.id === id);
  const mine = crew?.[0];
  const post: NewsPost | undefined =
    seed ?? (mine ? {
      id: mine.id, date: mine.date, tag: "Crew", title: mine.title,
      body: [mine.text || "📷"], section: "crew" as const, author: mine.author,
      ...(mine.port ? { port: mine.port } : {}),
    } : undefined) ?? (typeof window === "undefined" ? undefined : legacyPost(id, t));
  const photo = mine?.photo ?? null;
  if (!post) return <p>{t("news.notFound")}<Link href="/news" className="underline">{t("news.backNews")}</Link></p>;
  const section = SECTIONS.find((s) => s.id === post.section)?.label ?? post.section;
  return (
    <div className="grid max-w-2xl gap-3">
      <Link href="/news" className="w-fit text-sm font-bold underline">{t("news.backArrow")}</Link>
      {photo && <img src={photo} alt={post.title} className="w-full rounded-2xl object-cover ring-1 ring-amber-200 dark:ring-red-950" />}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{section}</span>
        <span className="rounded-full border px-2 py-0.5 font-bold opacity-70">{post.tag}</span>
        <span className="opacity-60">{post.date}</span>
      </div>
      <h1 className="text-3xl font-black">{post.title}</h1>
      {(post.author || post.port) && (
        <p className="text-sm font-bold opacity-60">👤 {post.author ?? t("news.anon")}{post.author && post.port ? " • " : ""}{post.port ?? ""}</p>
      )}
      {post.body.map((p, i) => <p key={i} className="font-medium leading-relaxed opacity-90">{p}</p>)}
      {post.visual === "fishmap" && (
        <div className="rounded-2xl border border-amber-200 bg-white p-3 dark:border-red-950 dark:bg-neutral-950 print:border-black">
          <FishMap />
        </div>
      )}
      <div className="print:hidden">
        <button onClick={() => sharePost(post, photo, t)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">{t("news.shareStory")}</button>
      </div>
    </div>
  );
}
