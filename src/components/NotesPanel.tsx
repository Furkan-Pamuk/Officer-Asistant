"use client";
import { useEffect, useRef, useState } from "react";
import { db, uid, getActiveContractId } from "@/lib/db";
import { useLiveQuery } from "@/hooks/useLiveQuery";
import DateField from "@/components/DateField";
import type { Note } from "@/lib/types";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function fmtRemind(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotesPanel({ contractScoped = true }: { contractScoped?: boolean }) {
  const [contractId, setContractId] = useState<string | null>(null);
  const notes = useLiveQuery(() => {
    if (contractScoped) {
      const id = getActiveContractId();
      return id ? db.notes.where("contractId").equals(id).toArray() : Promise.resolve([] as Note[]);
    }
    return db.notes.toArray();
  }, [contractScoped]);
  const [body, setBody] = useState("");
  const [remind, setRemind] = useState("");
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [showTr, setShowTr] = useState<string | null>(null);
  const [bellFor, setBellFor] = useState<string | null>(null);
  const [bellAt, setBellAt] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recogRef = useRef<{ stop: () => void } | null>(null);
  const transcriptRef = useRef("");

  function startSpeech() {
    const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!SR) return null;
    try {
      const rec = new SR();
      rec.lang = navigator.language || "en-US";
      rec.interimResults = false;
      rec.continuous = true;
      rec.onresult = (e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>; resultIndex: number }) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            const t = e.results[i][0].transcript.trim();
            transcriptRef.current += (transcriptRef.current ? " " : "") + t;
          }
        }
      };
      rec.start();
      return rec;
    } catch { return null; }
  }

  useEffect(() => { setContractId(getActiveContractId()); }, []);

  async function toggleRecord() {
    if (recording) {
      recRef.current?.stop();
      recogRef.current?.stop();
      recogRef.current = null;
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      transcriptRef.current = "";
      const sr = startSpeech();
      if (sr) recogRef.current = sr;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const url = await blobToDataUrl(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
        setAudioUrl(url);
        setRecording(false);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      alert("Microphone not available or permission denied.");
    }
  }

  async function add() {
    if (!body.trim() && !audioUrl) return;
    const cid = contractScoped ? getActiveContractId() : null;
    if (contractScoped && !cid) { alert("Select a contract first"); return; }
    await db.notes.add({
      id: uid("n"), title: voiceName.trim() || body.slice(0, 30) || "Voice note", body, tag: "general",
      audioDataUrl: audioUrl || undefined,
      transcript: transcriptRef.current || undefined,
      remindAt: remind || undefined, reminded: false,
      updatedAt: new Date().toISOString(), contractId: cid ?? undefined,
    });
    setBody(""); setRemind(""); setAudioUrl(""); setVoiceName("");
    transcriptRef.current = "";
  }

  async function setReminder(n: Note) {
    if (!bellAt) return;
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    await db.notes.update(n.id, { remindAt: new Date(bellAt).toISOString(), reminded: false });
    setBellFor(null); setBellAt("");
  }

  const list = (notes ?? []).slice().sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const [gallery, setGallery] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="rounded-2xl border border-amber-200 bg-white p-4 grid gap-2 dark:border-red-950 dark:bg-neutral-950">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Write note… Enter = save, Shift+Enter = new line" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }} className="rounded-xl border px-3 py-2 font-serif text-[15px] leading-relaxed" />
        {audioUrl && (
          <div className="grid gap-1">
            <audio controls src={audioUrl} className="w-full" />
            <input value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Name this recording (optional)" className="rounded-xl border px-3 py-1.5 text-sm" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={toggleRecord} className={`rounded-full px-4 py-2 font-bold text-white ${recording ? "animate-pulse bg-red-600" : "bg-stone-900 dark:bg-red-700"}`}>
            {recording ? "⏹ Stop recording" : "🎤 Voice note"}
          </button>
          <DateField mode="datetime" value={remind} onChange={setRemind} placeholder="Set reminder" className="rounded-xl border px-2 py-1.5 text-xs" />
          <button onClick={add} className="rounded-full border px-4 py-2 font-bold">Save note</button>
        </div>
      </div>
      <div className="oa-cork flex-1 rounded-2xl p-5">
        <div className="mb-1 text-center text-xs font-black uppercase tracking-widest text-amber-50/70">📌 Pinboard — tap to open all ({list.length})</div>
        {list.length === 0 ? (
          <p className="rounded-xl bg-white/90 p-4 text-center text-sm font-medium">No notes pinned yet.</p>
        ) : (
          <div onClick={() => setGallery(true)} onKeyDown={(e) => { if (e.key === "Enter") setGallery(true); }} role="button" tabIndex={0} className="relative block h-44 w-full cursor-pointer overflow-hidden text-left" title="Open all notes">
            {list.slice(0, 20).map((n, i, arr) => {
              const stepPct = arr.length <= 1 ? 0 : 78 / (arr.length - 1);
              const rot = ((i % 7) - 3) * 5;
              return (
                <span
                  key={n.id}
                  style={{ left: `${4 + i * stepPct}%`, top: `${8 + ((i * 37) % 40)}px`, transform: `rotate(${rot}deg)`, zIndex: i }}
                  className="oa-playing-card absolute w-36 rounded-xl border border-amber-200 bg-white p-2 shadow-[3px_4px_0_rgba(8,17,32,0.25)]"
                >
                  <span className="block truncate font-serif text-sm font-bold">{n.title}</span>
                  <span className="block truncate text-xs opacity-60">{n.audioDataUrl ? "🎤 voice" : (n.body || "—").slice(0, 30)}</span>
                  <span className="mt-0.5 flex items-center justify-between">
                    <button
                      onClick={(e) => { e.stopPropagation(); setGallery(true); setOpenId(n.id); setBellFor(n.id); setBellAt(""); }}
                      title="Set reminder"
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${n.remindAt && !n.reminded ? "bg-amber-400" : ""}`}
                    >
                      🔔{n.remindAt && !n.reminded ? " " + fmtRemind(n.remindAt) : ""}
                    </button>
                  </span>
                </span>
              );
            })}
            {list.length > 20 && <span className="absolute bottom-1 right-2 rounded-full bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-50">+{list.length - 20} more</span>}
          </div>
        )}
      </div>

      {gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setGallery(false); setOpenId(null); }}>
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border-4 border-amber-300 bg-white p-4 shadow-2xl dark:border-red-900 dark:bg-neutral-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-black">📌 All notes ({list.length})</h3>
              <button onClick={() => { setGallery(false); setOpenId(null); }} className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-amber-50 dark:bg-red-700 dark:text-white">Pin back 📌</button>
            </div>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-5">
              {list.map((n) => (
                <div key={n.id} className={`rounded-xl border p-2 text-xs ${openId === n.id ? "border-stone-900 ring-2 ring-amber-400 dark:border-red-500" : "border-amber-200 dark:border-red-950"}`}>
                  <button onClick={() => { setOpenId(openId === n.id ? null : n.id); setBellFor(null); }} className="block w-full text-left">
                    <strong className="block truncate font-serif text-sm">{n.title}</strong>
                    <span className="block truncate opacity-60">{n.audioDataUrl ? "🎤 voice" : (n.body || "—").slice(0, 40)}</span>
                  </button>
                  {openId === n.id && (
                    <div className="mt-1 border-t border-amber-200 pt-1 dark:border-red-950">
                      {n.body && <p className="whitespace-pre-wrap font-serif text-[13px] leading-relaxed">{n.body}</p>}
                      {n.audioDataUrl && <audio controls src={n.audioDataUrl} className="mt-1 w-full" />}
                      {n.transcript && (
                        <div className="mt-1">
                          <button onClick={() => setShowTr(showTr === n.id ? null : n.id)} className="rounded-full border px-2 py-0.5 text-[11px] font-bold">📝 Transcript {showTr === n.id ? "▴" : "▾"}</button>
                          {showTr === n.id && <p className="mt-1 rounded-lg bg-amber-50 p-1.5 dark:bg-black dark:ring-1 dark:ring-red-950">{n.transcript}</p>}
                        </div>
                      )}
                      <div className="mt-1 flex items-center justify-between opacity-70">
                        <span>{new Date(n.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {n.remindAt && !n.reminded && <span className="font-bold">⏰ {fmtRemind(n.remindAt)}</span>}
                      </div>
                      {bellFor === n.id ? (
                        <div className="mt-1 flex gap-1">
          <DateField mode="datetime" value={bellAt} onChange={setBellAt} placeholder="Set reminder" className="min-w-0 flex-1 rounded-lg border px-1 py-0.5" />
                          <button onClick={() => setReminder(n)} className="rounded-full bg-stone-900 px-2 py-0.5 font-bold text-amber-50">Set</button>
                        </div>
                      ) : (
                        <div className="mt-1 flex gap-1">
                          <button onClick={() => { setBellFor(n.id); setBellAt(""); }} className="rounded-full border px-2 py-0.5 font-bold">🔔</button>
                          <button onClick={() => db.notes.delete(n.id)} className="rounded-full border border-red-300 px-2 py-0.5 font-bold text-red-600">✕</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
