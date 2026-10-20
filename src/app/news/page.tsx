import Link from "next/link";
import { NEWS } from "@/lib/news";

export default function NewsPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">NEWS & Blog 📰</h1>
        <p className="text-sm font-medium opacity-70">Maritime updates and how-to articles from the Shark team.</p>
      </div>
      <div className="grid gap-3">
        {NEWS.slice().sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
          <Link key={n.id} href={`/news/${n.id}`} className="rounded-2xl border border-amber-200 bg-white p-4 hover:shadow dark:border-red-950 dark:bg-neutral-950">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white">{n.tag}</span>
              <span className="opacity-60">{n.date}</span>
            </div>
            <div className="mt-1 text-lg font-black">{n.title}</div>
            <div className="text-sm opacity-70">{n.body[0].slice(0, 140)}…</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

