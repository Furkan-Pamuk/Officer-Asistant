"use client";
import { Suspense } from "react";
import ExamsInner from "./exams-client";
import { useLocale } from "@/lib/i18n";

function ExamsFallback() {
  const { t } = useLocale();
  return <p>{t("exam.loading")}</p>;
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<ExamsFallback />}>
      <ExamsInner />
    </Suspense>
  );
}
