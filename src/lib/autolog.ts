"use client";
import { useEffect, useState } from "react";

const AUTO_KEY = "oa-log-auto";

const listeners = new Set<() => void>();

export function loadAuto(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveAuto(on: boolean) {
  try {
    localStorage.setItem(AUTO_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useAutoLog() {
  const [auto, setAutoState] = useState<boolean>(() => loadAuto());
  useEffect(() => {
    const refresh = () => setAutoState(loadAuto());
    listeners.add(refresh);
    return () => {
      listeners.delete(refresh);
    };
  }, []);
  const setAuto = (on: boolean) => {
    saveAuto(on);
  };
  return { auto, setAuto };
}
