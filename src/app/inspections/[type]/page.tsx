import { Suspense } from "react";
import DetailClient from "./DetailClient";
import { INSPECTION_TYPES } from "@/lib/data";

export function generateStaticParams() {
  return INSPECTION_TYPES.map((t) => ({ type: t.id }));
}

export default function InspectionDetail({ params }: { params: Promise<{ type: string }> }) {
  return (
    <div className="shark-interior-page">
      <Suspense fallback={<p>Loading cards…</p>}>
      <DetailClient params={params} />
    </Suspense>
    </div>
  );
}
