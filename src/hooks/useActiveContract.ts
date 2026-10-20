"use client";
import { useEffect, useRef, useState } from "react";
import { db, getActiveContractId } from "@/lib/db";
import type { Contract } from "@/lib/types";

export function useActiveContract() {
  const [contract, setContract] = useState<Contract | null | undefined>(undefined);
  const [all, setAll] = useState<Contract[]>([]);
  const prev = useRef("");

  useEffect(() => {
    async function load() {
      const list = await db.contracts.orderBy("updatedAt").reverse().toArray();
      const activeId = getActiveContractId();
      const key = JSON.stringify({ list, activeId });
      if (key === prev.current) return;
      prev.current = key;
      setAll(list);
      setContract(activeId ? (list.find((c) => c.id === activeId) ?? null) : null);
    }
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  return { contract, contracts: all };
}
