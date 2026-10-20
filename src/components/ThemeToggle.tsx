"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("oa-theme");
    const isDark = saved === "night";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("oa-theme", next ? "night" : "day");
  }

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-slate-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      aria-label="Toggle night mode"
    >
      {dark ? "🔴 Night" : "☀️ Day"}
    </button>
  );
}
