import { db } from "./db";
import type { RequestTab, SavedList, StoreRequest } from "./types";

export interface MyListCatalogItem {
  productId: string; // IMPA code or catalog ID
  name: string;
  category: RequestTab | string;
  unit: string;
  frequency: number;
  lastUsedAt: string;
  inCurrentList: boolean;
  currentQuantity?: string;
  source: "request" | "saved_list" | "catalogue";
}

const STORAGE_KEY_PREFIX = "oa-my-list-catalog-";

/**
 * Normalizes tab / category strings to known request tabs
 */
export function normalizeCategory(c?: string): RequestTab {
  if (!c) return "other";
  const lower = c.toLowerCase().trim();
  if (["galley", "stationery", "spare-deck", "spare-engine", "other"].includes(lower)) {
    return lower as RequestTab;
  }
  if (["provisions", "welfare", "cloth-linen", "galley", "clothing", "lavatory", "cleaning", "medicine"].includes(lower)) {
    return "galley";
  }
  if (lower === "stationery") return "stationery";
  if (["petroleum", "pneumatic-tools", "electrical", "machinery"].includes(lower)) {
    return "spare-engine";
  }
  if (["rope", "rigging-deck", "paint", "painting", "safety-gear", "safety", "hose", "nautical", "hardware", "brushes", "metal", "screws", "pipes", "pipe-fittings", "valves", "bearings", "packing", "welding", "hand-tools", "cutting", "measuring"].includes(lower)) {
    return "spare-deck";
  }
  return "other";
}

/**
 * Generates and maintains a catalog of items derived from "My List" (active requests & saved lists)
 */
export async function generateMyListCatalog(contractId?: string | null): Promise<MyListCatalogItem[]> {
  try {
    // 1. Fetch active requests for the vessel/contract
    const requests: StoreRequest[] = contractId
      ? await db.requests.where("contractId").equals(contractId).toArray()
      : await db.requests.toArray();

    // 2. Fetch saved lists for this vessel
    const savedLists: SavedList[] = contractId
      ? await db.savedLists.where("contractId").equals(contractId).toArray()
      : await db.savedLists.toArray();

    // Aggregation map keyed by productId (code) or normalized name
    const itemMap = new Map<string, MyListCatalogItem>();

    // Process current "My List" requests
    for (const req of requests) {
      const key = (req.code && req.code.trim()) || req.item.trim().toUpperCase();
      if (!key) continue;

      const existing = itemMap.get(key);
      if (existing) {
        existing.frequency += 1;
        existing.inCurrentList = true;
        existing.currentQuantity = req.quantity;
        if (req.updatedAt && req.updatedAt > existing.lastUsedAt) {
          existing.lastUsedAt = req.updatedAt;
        }
      } else {
        itemMap.set(key, {
          productId: req.code?.trim() || key,
          name: req.item.trim(),
          category: normalizeCategory(req.tab),
          unit: req.unit?.trim() || "pcs",
          frequency: 1,
          lastUsedAt: req.updatedAt || new Date().toISOString(),
          inCurrentList: true,
          currentQuantity: req.quantity,
          source: "request",
        });
      }
    }

    // Process items from saved lists to enrich catalog depth
    for (const sl of savedLists) {
      for (const it of sl.items) {
        const key = (it.code && it.code.trim()) || it.item.trim().toUpperCase();
        if (!key) continue;

        const existing = itemMap.get(key);
        if (existing) {
          existing.frequency += 1;
        } else {
          itemMap.set(key, {
            productId: it.code?.trim() || key,
            name: it.item.trim(),
            category: normalizeCategory(sl.scope),
            unit: it.unit?.trim() || "pcs",
            frequency: 1,
            lastUsedAt: sl.createdAt || new Date().toISOString(),
            inCurrentList: false,
            source: "saved_list",
          });
        }
      }
    }

    // Enrich with canonical IMPA catalog entries if code matches
    const catalogList = Array.from(itemMap.values());
    for (const entry of catalogList) {
      if (entry.productId && /^\d+$/.test(entry.productId)) {
        try {
          const canon = await db.catalogue.get(entry.productId);
          if (canon) {
            entry.name = canon.name || entry.name;
            entry.category = normalizeCategory(canon.category || entry.category);
            entry.unit = canon.unit || entry.unit;
          }
        } catch {
          // Ignore lookup errors
        }
      }
    }

    // Sort by frequency descending, then name
    catalogList.sort((a, b) => b.frequency - a.frequency || a.name.localeCompare(b.name));

    // Maintain persistent cache in localStorage for fast synchronous lookups
    if (typeof window !== "undefined") {
      const storageKey = STORAGE_KEY_PREFIX + (contractId || "default");
      try {
        localStorage.setItem(storageKey, JSON.stringify(catalogList));
        window.dispatchEvent(new CustomEvent("oa-my-list-catalog-updated", { detail: { count: catalogList.length } }));
      } catch {
        // Storage quota or SSR guard
      }
    }

    return catalogList;
  } catch (err) {
    console.error("Failed to generate My List catalog:", err);
    return [];
  }
}

/**
 * Triggers a catalog maintenance refresh
 */
export async function maintainMyListCatalog(contractId?: string | null): Promise<MyListCatalogItem[]> {
  return generateMyListCatalog(contractId);
}

/**
 * Reads cached My List catalog synchronously
 */
export function loadCachedMyListCatalog(contractId?: string | null): MyListCatalogItem[] {
  if (typeof window === "undefined") return [];
  try {
    const storageKey = STORAGE_KEY_PREFIX + (contractId || "default");
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return JSON.parse(raw) as MyListCatalogItem[];
  } catch {
    return [];
  }
}

/**
 * Extracts and prepares catalog context to send with AI requests.
 * Ensures the AI receives ground-truth catalog product IDs and strictly formatted catalog entries.
 */
export async function prepareCatalogContextForAI(
  contractId?: string | null,
  preferredCategory?: string | null
): Promise<Array<{ productId: string; name: string; category: string; unit: string; source: string }>> {
  // 1. Get all items from My List catalog (the officer's high-priority items)
  const myListItems = await generateMyListCatalog(contractId);

  const contextItems: Array<{ productId: string; name: string; category: string; unit: string; source: string }> = [];
  const seenIds = new Set<string>();

  // Add all My List items first (highest priority for accurate matching)
  for (const item of myListItems) {
    if (seenIds.has(item.productId)) continue;
    seenIds.add(item.productId);
    contextItems.push({
      productId: item.productId,
      name: item.name.toUpperCase(),
      category: item.category,
      unit: item.unit.toUpperCase(),
      source: "my_list",
    });
  }

  return contextItems;
}
