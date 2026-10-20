import { Suspense } from "react";
import ArchiveClient from "./ArchiveClient";

export default function ContractArchivePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p>Loading archive…</p>}>
      <ArchiveClient params={params} />
    </Suspense>
  );
}
