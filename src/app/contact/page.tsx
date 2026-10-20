"use client";
import { useEffect, useState } from "react";
import { db, getActiveContractId, uid } from "@/lib/db";

const EMAIL = "support@officerassistant.app";

export default function ContactPage() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

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
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <p className="text-sm font-medium text-stone-600 dark:text-red-300/70">Questions, content requests, bug reports — reach us on any channel.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <a href={`mailto:${EMAIL}`} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
          <div className="text-2xl">✉️</div>
          <div className="font-bold">Email</div>
          <div className="text-sm">{EMAIL}</div>
        </a>
        <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-4 opacity-70 dark:border-red-950 dark:bg-neutral-950">
          <div className="text-2xl">📸</div>
          <div className="font-bold">Instagram</div>
          <div className="text-sm">Coming soon</div>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-4 opacity-70 dark:border-red-950 dark:bg-neutral-950">
          <div className="text-2xl">💬</div>
          <div className="font-bold">WhatsApp</div>
          <div className="text-sm">Coming soon</div>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-red-950 dark:bg-neutral-950">
        <h2 className="font-bold">Message the team</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. Please add more CDI chemical questions…" className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" />
        <button onClick={send} className="mt-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Send message</button>
        {sent && <p className="mt-2 text-sm font-bold text-emerald-700">Saved — we read every message. ✅</p>}
      </div>
    </div>
  );
}
