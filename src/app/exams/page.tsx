import { Suspense } from "react";
import ExamsInner from "./exams-client";

export default function ExamsPage() {
  return (
    <Suspense fallback={<p>Yükleniyor…</p>}>
      <ExamsInner />
    </Suspense>
  );
}
