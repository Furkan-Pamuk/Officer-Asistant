"use client";
import { useEffect, useRef, useState } from "react";

export function useLiveQuery<T>(querier: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);
  const prevJson = useRef<string>("");

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const d = await querier();
        if (!alive) return;
        const j = JSON.stringify(d);
        if (j !== prevJson.current) {
          prevJson.current = j;
          setData(d);
        }
      } catch {
        // ignore transient IndexedDB errors
      }
    }
    run();
    const t = setInterval(run, 3000);
    return () => { alive = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}
