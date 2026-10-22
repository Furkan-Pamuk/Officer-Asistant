"use client";
import { useLocale } from "@/lib/i18n";
import { SOCIAL } from "@/lib/social";

export default function SiteFooter() {
  const { t } = useLocale();
  const ext = { target: "_blank", rel: "noreferrer" } as const;
  return (
    <footer className="border-t border-amber-200 bg-white px-4 py-4 text-center text-xs font-medium text-stone-600 print:hidden dark:border-red-950 dark:bg-black dark:text-red-400/70">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="mr-1 text-xs font-black uppercase tracking-widest">{t("footer.follow")}</span>
        <a href={SOCIAL.linkedin} {...ext} title="LinkedIn" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z"/></svg>
        </a>
        <a href={SOCIAL.instagram} {...ext} title="Instagram" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.4" fill="currentColor" stroke="none"/></svg>
        </a>
        <a href={SOCIAL.facebook} {...ext} title="Facebook" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.6l.5-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v7h3z"/></svg>
        </a>
        {SOCIAL.youtube ? (
        <a href={SOCIAL.youtube} {...ext} title="YouTube" aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.8-.5-5.6c-.3-1-1-1.7-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4c-1 .3-1.7 1-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6c.3 1 1 1.7 2 2 1.8.4 8.5.4 8.5.4s6.7 0 8.5-.4c-1 0 1.7-1 2-2 .5-1.8.5-5.6.5-5.6zM9.8 15.5v-7l6 3.5-6 3.5z"/></svg>
        </a>
        ) : null}
        <a href={SOCIAL.whatsapp} {...ext} title="WhatsApp" aria-label="WhatsApp" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.6-.9 2 .1 4.2 2.3 5.9 2.9 2.2 4.1 1.7 4.9 1.5.6-.2 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.1-.4-.2z"/></svg>
        </a>
        <a href={SOCIAL.x} {...ext} title="X" aria-label="X" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2zm-1.1 18h1.7L7 3.8H5.2L17.8 20z"/></svg>
        </a>
        <a href={SOCIAL.tiktok} {...ext} title="TikTok" aria-label="TikTok" className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300 hover:bg-amber-100 dark:border-red-900 dark:hover:bg-red-950">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.1 1.9 3.6 4.1 3.8v3c-1.6 0-3-.5-4.1-1.3v6.1c0 3.6-2.6 6.1-6.1 6.1-3.4 0-6-2.6-6-6s2.6-6 6-6c.3 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9c1.7 0 3-1.3 3-3V3h3.1z"/></svg>
        </a>
      </div>
      <div>
        {t("footer.disclaimer")}
        <span className="mx-2 opacity-40">•</span>
        <a href="/privacy" className="underline">{t("footer.privacy")}</a>
        <span className="mx-2 opacity-40">•</span>
        <a href="/terms" className="underline">{t("footer.terms")}</a>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="/about" className="font-bold underline underline-offset-4">{t("footer.about")}</a>
        <a href="/faq" className="font-bold underline underline-offset-4">{t("footer.faq")}</a>
        <a href="/pricing" className="font-bold underline underline-offset-4">{t("footer.pricing")}</a>
        <a href="/contact" className="font-bold underline underline-offset-4">{t("footer.contact")}</a>
      </div>
    </footer>
  );
}
