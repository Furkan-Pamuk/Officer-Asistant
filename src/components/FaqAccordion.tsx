"use client";
import { useState } from "react";
import { FAQ } from "@/lib/content";

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="grid gap-1.5">
      {FAQ.map((f, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-amber-200 bg-white dark:border-red-950 dark:bg-neutral-950">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold"
          >
            <span>{f.q}</span>
            <span className="shrink-0 text-amber-600 dark:text-red-400">{open === i ? "▾" : "▸"}</span>
          </button>
          {open === i && <p className="px-4 pb-4 text-sm font-medium leading-relaxed opacity-80">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
