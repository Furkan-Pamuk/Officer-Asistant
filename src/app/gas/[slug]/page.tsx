import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GASES, findGas } from "@/lib/gas-data";
import GasDetail from "./detail-client";

export function generateStaticParams() {
  return GASES.map((g) => ({ slug: g.slug }));
}

export default async function GasDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findGas(slug)) notFound();
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <GasDetail slug={slug} />
    </Suspense>
  );
}
