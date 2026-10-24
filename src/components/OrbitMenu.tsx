"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n";
import { NEWS } from "@/lib/news";
import type { MascotPoint } from "./SharkMascot";

interface MenuCard {
  icon: string;
  titleKey: string;
  descKey: string;
  href: string;
  links: { href: string; key: string }[];
}

interface OrbitMenuProps {
  items: readonly MenuCard[];
  children: ReactNode;
  onHoverItem?: (point: MascotPoint | null) => void;
  onSelectItem?: () => Promise<void>;
}

export default function OrbitMenu({ items, children, onHoverItem, onSelectItem }: OrbitMenuProps) {
  const { t } = useLocale();
  const router = useRouter();
  const navigation = useRef(0);
  const mounted = useRef(false);
  const [newsExpanded, setNewsExpanded] = useState(false);

  useEffect(() => {
    mounted.current = true;
    const navRef = navigation;
    return () => {
      mounted.current = false;
      navRef.current++;
    };
  }, []);

  function hover(element: HTMLElement) {
    if (!window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const rect = element.getBoundingClientRect();
    onHoverItem?.({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }

  async function select(event: { preventDefault: () => void }, href: string) {
    if (!onSelectItem || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    const request = ++navigation.current;
    try { await onSelectItem(); }
    catch { /* A decorative reaction must never block an existing destination. */ }
    finally { if (mounted.current && request === navigation.current) router.push(href); }
  }

  return (
    <div className="shark-orbit">
      <div className="shark-orbit-center">{children}</div>
      <div className="shark-orbit-grid">
        {items.map((item, index) => {
          const angle = (index * 360 / items.length - 90) * Math.PI / 180;
          const isNewsCard = item.href === "/news" || item.titleKey === "home.cardNews";

          return (
            <div
              key={item.titleKey}
              className={`shark-card shark-orbit-card rounded-2xl border p-4 sm:p-5 ${isNewsCard && newsExpanded ? "is-expanded" : ""}`}
              style={{ "--orbit-x": Math.cos(angle), "--orbit-y": Math.sin(angle) } as CSSProperties}
              onPointerEnter={event => { if (event.pointerType === "mouse") hover(event.currentTarget); }}
              onPointerLeave={() => onHoverItem?.(null)}
              onFocus={event => hover(event.currentTarget)}
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onHoverItem?.(null); }}
            >
              {isNewsCard ? (
                <div className="shark-news-card-inner">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={item.href}
                      onClick={event => { void select(event, item.href); }}
                      className="shark-card-link flex items-center gap-2.5 flex-1 min-w-0 rounded-lg group"
                    >
                      <span className="shark-card-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg select-none transition-transform group-hover:scale-110" aria-hidden="true">
                        {item.icon}
                      </span>
                      <h3 className="shark-card-title text-base sm:text-lg font-semibold leading-snug whitespace-nowrap group-hover:text-teal-700 dark:group-hover:text-red-400">
                        {t(item.titleKey)}
                      </h3>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewsExpanded(prev => !prev);
                      }}
                      aria-expanded={newsExpanded}
                      aria-controls="maritime-news-panel"
                      className="shark-news-toggle inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border transition-all shrink-0 cursor-pointer"
                      title={newsExpanded ? "Collapse maritime news updates" : "Expand maritime news updates"}
                    >
                      <span>{newsExpanded ? "Close" : "Updates"}</span>
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${newsExpanded ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <Link
                    href={item.href}
                    onClick={event => { void select(event, item.href); }}
                    className="block mt-2 rounded-lg"
                  >
                    <p className="shark-card-description text-xs leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </Link>

                  {newsExpanded && (
                    <div
                      id="maritime-news-panel"
                      className="shark-news-expanded mt-3 space-y-2 border-t pt-3"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-teal-800 dark:text-red-300">
                        <span>Maritime Bulletins</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {NEWS.slice(0, 3).map((post) => (
                          <Link
                            key={post.id}
                            href={`/news/${post.id}`}
                            onClick={event => { void select(event, `/news/${post.id}`); }}
                            className="block rounded-lg p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-teal-500/20 dark:hover:border-red-500/20"
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-teal-700 dark:text-red-300 font-medium">
                              <span className="rounded bg-teal-100/90 dark:bg-red-950/90 px-1.5 py-0.5 font-bold text-[9px] uppercase tracking-wide text-teal-900 dark:text-red-200">
                                {post.tag}
                              </span>
                              <span className="opacity-75">{post.date}</span>
                            </div>
                            <div className="mt-1 text-xs font-semibold leading-snug line-clamp-2 text-slate-900 dark:text-slate-100">
                              {post.title}
                            </div>
                            {post.body[0] && (
                              <p className="mt-1 text-[11px] line-clamp-2 text-slate-600 dark:text-slate-300">
                                {post.body[0]}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/news"
                        onClick={event => { void select(event, "/news"); }}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-teal-600/30 dark:border-red-500/30 bg-teal-500/15 dark:bg-red-500/15 py-1.5 text-xs font-semibold text-teal-900 dark:text-red-100 transition-colors hover:bg-teal-500/25 dark:hover:bg-red-500/25"
                      >
                        <span>View all maritime news</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href={item.href}
                    onClick={event => { void select(event, item.href); }}
                    className="shark-card-link block rounded-lg group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shark-card-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg select-none transition-transform group-hover:scale-110" aria-hidden="true">
                        {item.icon}
                      </span>
                      <h3 className="shark-card-title text-base sm:text-lg font-semibold leading-snug whitespace-nowrap group-hover:text-teal-700 dark:group-hover:text-red-400">
                        {t(item.titleKey)}
                      </h3>
                    </div>
                    <p className="shark-card-description mt-2 text-xs leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </Link>

                  {item.links.length > 0 && (
                    <div className="shark-card-links mt-3 flex flex-wrap gap-1.5 border-t pt-3">
                      {item.links.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={event => { void select(event, link.href); }}
                          className="shark-chip inline-flex min-h-8 items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                        >
                          {t(link.key)}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
