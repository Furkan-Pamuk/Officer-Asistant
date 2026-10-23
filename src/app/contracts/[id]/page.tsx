import { Suspense } from "react";
import ArchiveClient from "./ArchiveClient";

export default function ContractArchivePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="shark-interior-page">
      <Suspense fallback={<p>Loading archive…</p>}>
      <ArchiveClient params={params} />
    </Suspense>
    </div>
  );
}
