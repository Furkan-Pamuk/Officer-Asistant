import { Suspense } from "react";
import NewsPostClient from "./NewsPostClient";
import { NEWS } from "@/lib/news";

export function generateStaticParams() {
  return NEWS.map((n) => ({ id: n.id }));
}

export default function NewsPost({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="shark-interior-page">
      <Suspense fallback={<p>Loading…</p>}>
      <NewsPostClient params={params} />
    </Suspense>
    </div>
  );
}
