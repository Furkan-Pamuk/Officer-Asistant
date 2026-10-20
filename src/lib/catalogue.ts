import { db, uid } from "./db";
import type { CatalogueItem } from "./types";

// CSV format: code,name,unit,category  (header row optional)
export function parseCatalogueCSV(text: string): CatalogueItem[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: CatalogueItem[] = [];
  for (const line of lines) {
    if (/^code\s*,/i.test(line)) continue;
    // split on commas not inside quotes
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((p) => p.replace(/^"|"$/g, "").trim()) ?? [];
    if (parts.length < 2) continue;
    const [code, name, unit = "pcs", category = ""] = parts;
    if (!code || !name) continue;
    out.push({ code, name, unit, category });
  }
  return out;
}

export async function importCatalogue(items: CatalogueItem[]) {
  if (!items.length) return 0;
  // Chunked so multi-thousand-row IMPA imports don't block the UI
  const CHUNK = 1000;
  for (let i = 0; i < items.length; i += CHUNK) {
    await db.catalogue.bulkPut(items.slice(i, i + CHUNK));
  }
  return items.length;
}

export function matchCatalogue(all: CatalogueItem[], q: string, limit = 8): CatalogueItem[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  return all
    .filter((c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s))
    .slice(0, limit);
}

export async function learnFromHistory(item: string, code: string, unit: string, category: string) {
  const name = item.trim();
  if (!name) return;
  if (code.trim()) {
    await db.catalogue.put({ code: code.trim(), name, unit: unit || "pcs", category }).catch(() => {});
  }
}

export { uid };
