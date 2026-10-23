"use client";

import { useEffect, useMemo, useState } from "react";
import {
  generateMyListCatalog,
  loadCachedMyListCatalog,
  maintainMyListCatalog,
  type MyListCatalogItem,
} from "@/lib/my-list-catalog";
import { db, uid } from "@/lib/db";
import type { RequestTab } from "@/lib/types";

interface MyListCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
  onItemAdded?: (item: MyListCatalogItem) => void;
}

export default function MyListCatalogModal({
  isOpen,
  onClose,
  contractId,
  onItemAdded,
}: MyListCatalogModalProps) {
  const [items, setItems] = useState<MyListCatalogItem[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen, contractId]);

  async function loadCatalog() {
    setLoading(true);
    // 1. Try instant load from cache
    const cached = loadCachedMyListCatalog(contractId);
    if (cached.length > 0) {
      setItems(cached);
    }
    // 2. Generate and maintain fresh catalog from My List
    const fresh = await maintainMyListCatalog(contractId);
    setItems(fresh);
    setLoading(false);
  }

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return items.filter((it) => {
      const matchCat = activeCategory === "all" || it.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        it.name.toLowerCase().includes(q) ||
        it.productId.toLowerCase().includes(q) ||
        it.unit.toLowerCase().includes(q)
      );
    });
  }, [items, filter, activeCategory]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const it of items) {
      counts[it.category] = (counts[it.category] || 0) + 1;
    }
    return counts;
  }, [items]);

  async function addCatalogItemToCurrentList(it: MyListCatalogItem) {
    if (!contractId) return;
    await db.requests.add({
      id: uid("r"),
      tab: (it.category as RequestTab) || "other",
      item: it.name,
      code: it.productId,
      quantity: "1",
      unit: it.unit,
      status: "draft",
      note: "From My List Catalog",
      updatedAt: new Date().toISOString(),
      contractId,
    });
    // Refresh catalog
    await loadCatalog();
    if (onItemAdded) onItemAdded(it);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-[#fffdfa] text-stone-900 shadow-2xl dark:border-red-950 dark:bg-neutral-950 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50/70 px-5 py-4 dark:border-stone-800 dark:bg-stone-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 className="font-serif text-lg font-black">My List Catalog</h2>
              <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-bold text-amber-50 dark:bg-red-700">
                {items.length} items
              </span>
            </div>
            <p className="mt-0.5 text-xs opacity-75">
              Automatically generated & maintained from your store requests. Included in every AI vision request for strict matching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border bg-white font-bold text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 p-3 dark:border-stone-800">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search catalog by name or product ID..."
            className="min-w-60 flex-1 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-sm dark:border-stone-800 dark:bg-stone-900"
          />
          <button
            onClick={loadCatalog}
            disabled={loading}
            className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-amber-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            {loading ? "🔄 Re-indexing..." : "🔄 Sync & Re-generate"}
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-amber-100 px-4 py-2 text-xs dark:border-stone-800">
          {["all", "spare-deck", "spare-engine", "galley", "stationery", "other"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-2.5 py-1 font-bold ${
                activeCategory === cat
                  ? "bg-stone-900 text-amber-50 dark:bg-red-700 dark:text-white"
                  : "bg-amber-50 hover:bg-amber-100 dark:bg-stone-900 dark:hover:bg-stone-800"
              }`}
            >
              {cat === "all" ? "All" : cat} ({categories[cat] || 0})
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm opacity-60">
              {items.length === 0
                ? "No catalog items found yet. Add items to 'My List' to automatically generate this catalog!"
                : "No items match your filter."}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredItems.map((it) => (
                <div
                  key={it.productId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200/80 bg-white p-3 shadow-xs dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span className="rounded-md bg-stone-900 px-2 py-1 font-mono text-xs font-bold text-amber-50 dark:bg-red-700">
                      {it.productId}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold">{it.name}</h4>
                      <div className="flex items-center gap-2 text-[11px] opacity-70">
                        <span className="rounded bg-amber-100 px-1.5 py-0.2 font-medium dark:bg-stone-800">
                          {it.category}
                        </span>
                        <span>• {it.unit}</span>
                        <span>• Ordered {it.frequency}×</span>
                        {it.inCurrentList && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            (Active in My List: {it.currentQuantity} {it.unit})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addCatalogItemToCurrentList(it)}
                    className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-amber-50 hover:bg-stone-800 dark:bg-red-700 dark:text-white"
                  >
                    + Add to Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50/50 px-5 py-3 text-xs dark:border-stone-800 dark:bg-stone-950">
          <span className="opacity-70">
            Catalog Context Active • Ready for AI Camera Requests
          </span>
          <button
            onClick={onClose}
            className="rounded-full bg-stone-900 px-4 py-1.5 font-bold text-amber-50 dark:bg-red-700 dark:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
