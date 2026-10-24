"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const pathname = usePathname();
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const timers = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  const finish = useCallback(() => {
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
  }, [clearAll]);

  // Listen for dismiss event from registration, login or offline bypass
  useEffect(() => {
    const handleDismiss = () => finish();
    window.addEventListener("shark-intro-dismiss", handleDismiss);
    return () => window.removeEventListener("shark-intro-dismiss", handleDismiss);
  }, [finish]);

  // If user becomes authenticated while intro is showing, dismiss it immediately
  useEffect(() => {
    if (user && stage !== null) {
      finish();
    }
  }, [user, stage, finish]);

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

    // Never show intro on authentication or administrative paths
    if (
      pathname &&
      (pathname.startsWith("/login") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/api"))
    ) {
      return;
    }

    // If user has already seen the intro and it's not forced via ?intro=1, do not show
    if (seen && !forced) {
      return;
    }

    // If user is already authenticated (or cached), mark seen and skip
    try {
      const cached = localStorage.getItem("shark_cached_user");
      if (cached && !forced) {
        localStorage.setItem(SEEN_KEY, "1");
        return;
      }
    } catch {}

    if (user && !forced) {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      return;
    }

    // First-ever visit or forced via ?intro=1: show intro
    setStage("idle");

    return () => {
      clearAll();
      try {
        voiceRef.current?.pause();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user]);

  if (stage === null) return null;

  return (
    <div ref={overlayRef} className="shark-intro" role="dialog" aria-label={t("intro.aria")}>
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
      <div className="shark-intro-frame" aria-hidden="true" />

      {stage === "idle" && (
        <>
          <button
            onClick={finish}
            type="button"
            aria-label="Skip intro"
            className="absolute top-6 right-6 z-20 rounded-full border border-teal-400/30 bg-stone-900/80 px-4 py-1.5 text-xs font-bold text-teal-200 backdrop-blur-md transition hover:bg-stone-800 hover:text-white"
          >
            Skip ✕
          </button>
          <div className="shark-intro-content absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
            <div className="shark-intro-seal">
              <svg width="84" height="84" viewBox="0 0 64 64" aria-hidden="true">
                <rect x="2" y="2" width="60" height="60" rx="14" fill="#081120" stroke="#2AA198" strokeWidth="1.5" />
                <path d="M21 48 C24 32 31 21 48 13 C44 26 42 36 42 48 Z" fill="#8B98A5" />
                <rect x="12" y="44" width="40" height="3" rx="1.5" fill="#2AA198" />
                <rect x="18" y="50" width="28" height="3" rx="1.5" fill="#2AA198" opacity="0.45" />
              </svg>
            </div>
            <div>
              <p className="shark-intro-wordmark">SHARK</p>
              <p className="shark-intro-tagline">{t("intro.tagline")}</p>
            </div>
            <button
              onClick={dive}
              className="shark-dive-btn"
            >
              {t("intro.start")}
            </button>
            <p className="shark-intro-sound">{t("intro.sound")}</p>
          </div>
        </>
      )}
    </div>
  );
}
