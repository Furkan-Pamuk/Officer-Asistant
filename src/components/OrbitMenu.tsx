"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useLocale } from "@/lib/i18n";
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
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; navigation.current++; };
  }, []);

  function hover(element: HTMLElement) {
    if (!window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
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
          return (
            <div key={item.titleKey} className="shark-card shark-orbit-card rounded-2xl border p-3 sm:p-4"
              style={{ "--orbit-x": Math.cos(angle), "--orbit-y": Math.sin(angle) } as CSSProperties}
              onPointerEnter={event => { if (event.pointerType === "mouse") hover(event.currentTarget); }}
              onPointerLeave={() => onHoverItem?.(null)}
              onFocus={event => hover(event.currentTarget)}
              onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onHoverItem?.(null); }}>
              <Link href={item.href} onNavigate={event => { void select(event, item.href); }} className="shark-card-link block rounded-lg">
                <div className="shark-card-icon mb-3 flex h-9 w-9 items-center justify-center rounded-xl text-lg" aria-hidden="true">{item.icon}</div>
                <div className="shark-card-title text-base font-semibold leading-snug">{t(item.titleKey)}</div>
                <div className="shark-card-description mt-2 text-xs leading-relaxed">{t(item.descKey)}</div>
              </Link>
              {item.links.length > 0 && (
                <div className="shark-card-links mt-3 flex flex-wrap gap-1 border-t pt-3">
                  {item.links.map(link => (
                    <Link key={link.href} href={link.href} onNavigate={event => { void select(event, link.href); }} className="shark-chip inline-flex min-h-10 items-center rounded-xl border px-2 py-2 text-xs font-medium">
                      {t(link.key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
