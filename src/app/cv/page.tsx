"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CvPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile?tab=cv");
  }, [router]);
  return <p>Opening CV Builder…</p>;
}
