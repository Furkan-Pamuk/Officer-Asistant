import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CARGOES, findCargo } from "@/lib/cargo-data";
import CargoDetail from "./detail-client";

export function generateStaticParams() {
  return CARGOES.map((c) => ({ slug: c.slug }));
}

export default async function CargoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findCargo(slug)) notFound();
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <CargoDetail slug={slug} />
    </Suspense>
  );
}
