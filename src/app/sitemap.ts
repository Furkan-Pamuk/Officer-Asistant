import type { MetadataRoute } from "next";

const PAGES = [
  "",
  "/about",
  "/faq",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/news",
  "/exams",
  "/route",
  "/checklists",
  "/inspections",
  "/library",
  "/cargo",
  "/bulks",
  "/gas",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://crew-mate-blush.vercel.app").replace(/\/$/, "");
  const now = new Date();
  return PAGES.map((p) => ({
    url: `${base}${p === "" ? "" : p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/news" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/news" || p === "/exams" ? 0.8 : 0.6,
  }));
}
