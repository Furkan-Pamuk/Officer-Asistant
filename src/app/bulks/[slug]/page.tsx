import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BULKS, findBulk } from "@/lib/imsbc-data";
import BulkDetail from "./detail-client";

export function generateStaticParams() {
  return BULKS.map((b) => ({ slug: b.slug }));
}

export default async function BulkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findBulk(slug)) notFound();
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <BulkDetail slug={slug} />
    </Suspense>
  );
}
