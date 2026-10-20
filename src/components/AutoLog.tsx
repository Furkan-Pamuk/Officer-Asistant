"use client";
import { useEffect, useRef } from "react";
import { db, getActiveContractId, uid } from "@/lib/db";
import { INTERVALS, snapshotPosition } from "@/lib/logbook";
import { loadAuto } from "@/lib/autolog";

// Global deck-log engine: ticks on EVERY screen while the app is open,
// not just on the log page. Survives navigation and reloads (the switch
// is persisted). Stops when the app is fully closed — browsers allow no
// code to run then. No backfill: a logbook must never invent past entries.
export default function AutoLog() {
  const lockRef = useRef<{ release?: () => void } | null>(null);

  useEffect(() => {
    let alive = true;
    let watchId: number | null = null;
    let awakeFor = false;

    async function wake(on: boolean) {
      try {
        if (lockRef.current?.release) {
          lockRef.current.release();
          lockRef.current = null;
        }
      } catch {
        /* ignore */
      }
      if (!on) return;
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (t: string) => Promise<{ release: () => void }> };
        };
        if (!nav.wakeLock) return;
        lockRef.current = await nav.wakeLock.request("screen");
      } catch {
        /* ignore */
      }
    }

    function ensureWatch(on: boolean) {
      if (on && watchId === null && "geolocation" in navigator) {
        try {
          watchId = navigator.geolocation.watchPosition(
            (p) => {
              try {
                localStorage.setItem("oa-pos", JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }));
              } catch {
                /* ignore */
              }
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 }
          );
        } catch {
          /* ignore */
        }
      } else if (!on && watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {
          /* ignore */
        }
        watchId = null;
      }
    }

    async function tick() {
      try {
        const on = loadAuto();
        ensureWatch(on);
        if (on && !awakeFor) {
          awakeFor = true;
          void wake(true);
        } else if (!on && awakeFor) {
          awakeFor = false;
          void wake(false);
        }
        if (!on) return;
        const cid = getActiveContractId();
        if (!cid) return;
        const raw = localStorage.getItem("oa-log-interval") ?? "1h";
        const step = INTERVALS.find((x) => x.id === raw)?.ms ?? 3600000;
        const lastKey = `oa-log-last-${cid}`;
        let last = 0;
        try {
          last = Number(localStorage.getItem(lastKey) ?? 0);
        } catch {
          /* ignore */
        }
        if (Date.now() - last >= step) {
          const s = await snapshotPosition();
          if (!alive) return;
          await db.logEntries.add({
            id: uid("log"),
            contractId: cid,
            time: new Date().toISOString(),
            lat: s.lat,
            lon: s.lon,
            tz: s.tz,
            compass: "",
            windKn: s.windKn,
            windDir: s.windDir,
            waveM: s.waveM,
            visKm: s.visKm,
            dryT: "",
            wetT: "",
            variation: "",
            note: "",
            auto: true,
          });
          try {
            localStorage.setItem(lastKey, String(Date.now()));
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* ignore */
      }
      if (alive) setTimeout(tick, 60000);
    }

    function onVis() {
      if (document.visibilityState === "visible" && loadAuto()) {
        void wake(true);
        void tick();
      }
    }

    // fresh GPS while auto is on, app-wide (any screen).
    // The tick loop reconciles watch + wake lock every minute.
    ensureWatch(loadAuto());
    if (loadAuto()) {
      awakeFor = true;
      void wake(true);
    }
    const t = setTimeout(tick, 10000);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {
          /* ignore */
        }
      }
      try {
        lockRef.current?.release?.();
      } catch {
        /* ignore */
      }
      lockRef.current = null;
    };
  }, []);

  return null;
}
