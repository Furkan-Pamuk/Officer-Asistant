"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";

const SEEN_KEY = "shark-intro-seen";

// Optional studio voice-over: place the file at public/audio/intro-voice.mp3
// (mp3, ~6s). Everything else works without it.
const VOICE_SRC = "/audio/intro-voice.mp3";

type Stage = "idle" | "swim";

// The crossing, in viewport-width units. The snout travels from just off
// the left edge to well off the right. The curtain stays fully closed until
// the tail swims in, then its edge rides just behind the tail all the way out.
const START_SNOUT = -5;
const END_SNOUT = 150;
const TAIL_GAP = 43; // snout-to-tail + breathing room, vw
const SWIM_S = 6.2; // seconds for the full crossing

export default function SharkIntro() {
  const [stage, setStage] = useState<Stage | null>(null);
  const { t } = useLocale();
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  function clearAll() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    cancelAnimationFrame(rafRef.current);
  }

  function finish() {
    clearAll();
    try {
      voiceRef.current?.pause();
    } catch {
      /* ignore */
    }
    voiceRef.current = null;
    try {
      const v = vidRef.current;
      if (v) v.pause();
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setStage(null);
  }

  function playVideo() {
    try {
      const v = vidRef.current;
      if (!v) return;
      v.muted = true;
      v.playbackRate = 0.65;
      v.currentTime = 0;
      void v.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }

  function dive() {
    if (stage !== "idle") return;
    try {
      const a = new Audio(VOICE_SRC);
      a.volume = 1;
      voiceRef.current = a;
      void a.play().catch(() => {
        voiceRef.current = null;
      });
    } catch {
      voiceRef.current = null;
    }
    playVideo();
    setStage("swim");
    const t0 = performance.now();
    const step = (now: number) => {
      const el = (now - t0) / 1000;
      const p = Math.min(el / SWIM_S, 1.2);
      const snout = START_SNOUT + p * (END_SNOUT - START_SNOUT);
      const edge = Math.min(110, Math.max(0, snout - TAIL_GAP));
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translateX(${edge}vw)`;
      }
      try {
        const v = vidRef.current;
        if (v) {
          const q = Math.min(el / SWIM_S, 1);
          v.style.transform = `scale(${1 + q * 0.18}) translateX(${-q * 7}%)`;
        }
      } catch {
        /* ignore */
      }
      if (edge >= 104 || p >= 1.2) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    let seen = false;
    let forced = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
      forced = new URLSearchParams(window.location.search).get("intro") === "1";
    } catch {
      /* ignore */
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    if (!seen || forced) setStage("idle");
    return () => {
      clearAll();
      try {
        voiceRef.current?.pause();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === null) return null;

  return (
    <div ref={overlayRef} className="shark-intro" role="dialog" aria-label={t("intro.aria")}>
      <style>{`
        .shark-intro { position: fixed; inset: 0; z-index: 100; overflow: hidden; background: #020608; will-change: transform; }
        .shark-footage { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .shark-footage.idle-drift { animation: drift 12s ease-in-out infinite alternate; }
        @keyframes drift { from { transform: scale(1) translateX(0); } to { transform: scale(1.12) translateX(-4%); } }
        .shark-tint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(4,10,20,0.55), rgba(4,10,20,0.3) 45%, rgba(4,10,20,0.6)); }
        .shark-vignette { position: absolute; inset: 0; box-shadow: inset 0 0 18vmin 6vmin rgba(0,0,0,0.85); pointer-events: none; }
        .shark-dive-btn { animation: glowPulse 1.6s ease-in-out infinite; }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(42,161,152,0.55); } 50% { box-shadow: 0 0 34px 6px rgba(42,161,152,0.45); } }
      `}</style>

      <video
        ref={(el) => {
          vidRef.current = el;
          if (el) el.muted = true;
        }}
        className={`shark-footage${stage === "idle" ? " idle-drift" : ""}`}
        src="/intro-shark.mp4"
        muted
        playsInline
        loop
        preload="auto"
        autoPlay
      />
      <div className="shark-tint" />
      <div className="shark-vignette" />

      {stage === "idle" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <svg width="84" height="84" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="2" y="2" width="60" height="60" rx="14" fill="#081120" stroke="#2AA198" strokeWidth="1.5" />
            <path d="M21 48 C24 32 31 21 48 13 C44 26 42 36 42 48 Z" fill="#8B98A5" />
            <rect x="12" y="44" width="40" height="3" rx="1.5" fill="#2AA198" />
            <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#2AA198" opacity="0.45" />
          </svg>
          <div>
            <p className="text-4xl font-black tracking-[0.2em] text-white">SHARK</p>
            <p className="mt-2 text-sm font-semibold tracking-widest text-[#2AA198]">{t("intro.tagline")}</p>
          </div>
          <button
            onClick={dive}
            className="shark-dive-btn rounded-full bg-[#2AA198] px-10 py-4 text-lg font-black tracking-widest text-[#081120]"
          >
            {t("intro.start")}
          </button>
          <p className="text-xs font-medium text-[#8B98A5]">{t("intro.sound")}</p>
        </div>
      )}
    </div>
  );
}
