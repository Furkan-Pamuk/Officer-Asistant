"use client";
import { use } from "react";
import Link from "next/link";
import { NEWS } from "@/lib/news";

export default function NewsPostClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = NEWS.find((n) => n.id === id);
  if (!post) return <p>Not found. <Link href="/news" className="underline">Back to news</Link></p>;
  return (
    <div className="grid max-w-2xl gap-3">
      <Link href="/news" className="w-fit text-sm font-bold underline">← News</Link>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{post.tag}</span>
        <span className="opacity-60">{post.date}</span>
      </div>
      <h1 className="text-3xl font-black">{post.title}</h1>
      {post.body.map((p, i) => <p key={i} className="font-medium leading-relaxed opacity-90">{p}</p>)}
    </div>
  );
}
