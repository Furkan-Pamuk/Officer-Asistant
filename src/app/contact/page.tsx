"use client";
import { useEffect, useState } from "react";
import { db, getActiveContractId, uid } from "@/lib/db";
import { useLocale } from "@/lib/i18n";
import { SOCIAL } from "@/lib/social";

const EMAIL = "support@officerassistant.app";

export default function ContactPage() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const { t } = useLocale();

  async function send() {
    if (!text.trim()) return;
    await db.messages.add({ id: uid("msg"), channel: "in-app", text: text.trim(), contractId: getActiveContractId() ?? undefined, createdAt: new Date().toISOString() });
    setText("");
    setSent(true);
  }

  useEffect(() => {
    if (sent) {
      const t = setTimeout(() => setSent(false), 4000);
      return () => clearTimeout(t);
    }
  }, [sent]);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t("contact.title")}</h1>
        <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">{t("contact.sub")}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <a href={`mailto:${EMAIL}`} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <div className="text-2xl">✉️</div>
          <div className="font-bold">{t("contact.email")}</div>
          <div className="text-sm">{EMAIL}</div>
        </a>
        <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="rounded-2xl border border-amber-200 bg-white p-4 hover:bg-amber-50 dark:border-red-950 dark:bg-neutral-950 dark:hover:bg-red-950/40">
          <div className="text-2xl">📸</div>
          <div className="font-bold">{t("contact.insta")}</div>
          <div className="text-sm">@shark.application ↗</div>
        </a>
        <a href={SOCIAL.whatsapp} target="_blank" rel="noreferrer" className="rounded-2xl border border-amber-200 bg-white p-4 hover:bg-amber-50 dark:border-red-950 dark:bg-neutral-950 dark:hover:bg-red-950/40">
          <div className="text-2xl">💬</div>
          <div className="font-bold">{t("contact.wa")}</div>
          <div className="text-sm">Channel ↗</div>
        </a>
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <a href={SOCIAL.facebook} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-red-950/40">Facebook ↗</a>
        <a href={SOCIAL.x} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-red-950/40">X ↗</a>
        <a href={SOCIAL.tiktok} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-red-950/40">TikTok ↗</a>
        <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 hover:bg-amber-50 dark:hover:bg-red-950/40">LinkedIn ↗</a>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">{t("contact.form")}</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={t("contact.msgPh")} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
        <button onClick={send} className="mt-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">{t("contact.send")}</button>
        {sent && <p className="mt-2 text-sm font-bold text-emerald-700">{t("contact.saved")}</p>}
      </div>
    </div>
  );
}
