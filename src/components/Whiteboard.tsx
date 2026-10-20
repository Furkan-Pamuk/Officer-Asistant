"use client";
import { useEffect, useState } from "react";

const KEY = "oa-whiteboard";
const MODE_KEY = "oa-whiteboard-mode";

const QUOTES: { text: string; by: string }[] = [
  { text: "Smooth seas do not make skillful sailors.", by: "African proverb" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", by: "Chinese proverb" },
  { text: "It always seems impossible until it's done.", by: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", by: "Winston Churchill" },
  { text: "The pessimist complains about the wind; the optimist expects it to change; the realist adjusts the sails.", by: "William Arthur Ward" },
  { text: "He who has a why to live can bear almost any how.", by: "Friedrich Nietzsche" },
  { text: "Discipline is choosing what you want most over what you want now.", by: "Abraham Lincoln (attr.)" },
  { text: "A smooth sea never made a skilled mariner — keep your logbook full and your standards higher.", by: "Shark" },
  { text: "Whether you think you can or you think you can't, you're right.", by: "Henry Ford" },
  { text: "The secret of getting ahead is getting started.", by: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", by: "Sam Levenson" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", by: "C.S. Lewis" },
];

export default function Whiteboard() {
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [auto, setAuto] = useState(false);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    try {
      setText(localStorage.getItem(KEY) ?? "");
      setAuto(localStorage.getItem(MODE_KEY) === "auto");
      setQuote(Math.floor(Math.random() * QUOTES.length));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 10000);
    return () => clearInterval(t);
  }, [auto]);

  function toggleAuto() {
    const next = !auto;
    setAuto(next);
    if (next) setQuote(Math.floor(Math.random() * QUOTES.length));
    try {
      localStorage.setItem(MODE_KEY, next ? "auto" : "manual");
    } catch { /* ignore */ }
  }

  function save() {
    setText(draft);
    try {
      localStorage.setItem(KEY, draft);
    } catch { /* ignore */ }
    setEditing(false);
  }

  const q = QUOTES[quote % QUOTES.length];

  return (
    <div className="rounded-2xl border-8 border-amber-300 bg-white p-4 shadow-lg dark:border-red-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black">Whiteboard</h2>
        <div className="flex gap-2">
          <button onClick={toggleAuto} className={`rounded-full px-3 py-1 text-xs font-bold ${auto ? "bg-amber-400 text-stone-950 dark:bg-red-600 dark:text-white" : "border"}`}>
            {auto ? "✨ Auto Motivate: ON" : "✨ Auto Motivate"}
          </button>
          <button onClick={() => { if (editing) save(); else { setDraft(text); setEditing(true); } }} className="rounded-full border px-3 py-1 text-xs font-bold">
            {editing ? "Pin it 📌" : "✏️ Write"}
          </button>
        </div>
      </div>
      {auto ? (
        <div key={quote} className="mt-2">
          <p className="font-serif text-xl italic leading-relaxed text-stone-900 dark:text-red-200">“{q.text}”</p>
          <p className="mt-1 text-right text-sm font-bold opacity-70">— {q.by}</p>
        </div>
      ) : editing ? (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Motivation quote, career goal, anything…" className="mt-2 w-full rounded-xl border-2 border-dashed border-amber-300 px-3 py-2 font-serif text-lg italic" />
      ) : (
        <p className="mt-2 min-h-16 whitespace-pre-wrap font-serif text-xl italic leading-relaxed text-stone-900 dark:text-red-200">
          {text || "Tap ✏️ Write — or ✨ Auto Motivate for famous quotes."}
        </p>
      )}
    </div>
  );
}

