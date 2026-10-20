"use client";
import { use } from "react";
import Link from "next/link";
import { NEWS, SECTIONS, type NewsPost } from "@/lib/news";

const CREW_KEY = "oa-crew-posts";

function findPost(id: string): NewsPost | undefined {
  const seed = NEWS.find((n) => n.id === id);
  if (seed) return seed;
  try {
    const raw = JSON.parse(localStorage.getItem(CREW_KEY) ?? "[]");
    if (Array.isArray(raw)) return raw.find((p) => p?.id === id);
  } catch { /* ignore */ }
  return undefined;
}

async function sharePost(post: NewsPost) {
  const text = `${post.title}\n\n${post.body.join("\n\n")}\n\n— via Shark`;
  try {
    if (navigator.share) {
      await navigator.share({ title: post.title, text });
      return;
    }
    throw 0;
  } catch {
    try {
      await navigator.clipboard.writeText(text);
      alert("Story copied — paste it anywhere.");
    } catch {
      alert("Sharing not available here.");
    }
  }
}

export default function NewsPostClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = typeof window === "undefined" ? NEWS.find((n) => n.id === id) : findPost(id);
  if (!post) return <p>Not found. <Link href="/news" className="underline">Back to news</Link></p>;
  const section = SECTIONS.find((s) => s.id === post.section)?.label ?? post.section;
  return (
    <div className="grid max-w-2xl gap-3">
      <Link href="/news" className="w-fit text-sm font-bold underline">← News</Link>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{section}</span>
        <span className="rounded-full border px-2 py-0.5 font-bold opacity-70">{post.tag}</span>
        <span className="opacity-60">{post.date}</span>
      </div>
      <h1 className="text-3xl font-black">{post.title}</h1>
      {(post.author || post.port) && (
        <p className="text-sm font-bold opacity-60">{post.author ?? ""}{post.author && post.port ? " • " : ""}{post.port ?? ""}</p>
      )}
      {post.body.map((p, i) => <p key={i} className="font-medium leading-relaxed opacity-90">{p}</p>)}
      <div className="print:hidden">
        <button onClick={() => sharePost(post)} className="rounded-full border bg-white px-4 py-2 text-sm font-bold dark:bg-black">📤 Share story</button>
      </div>
    </div>
  );
}
