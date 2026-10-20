"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { contractDays } from "@/components/ServiceBoard";
import { useActiveContract } from "@/hooks/useActiveContract";

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s.length === 10 ? s + "T00:00:00" : s);
  return isNaN(d.getTime()) ? null : d;
}

// Big dark counter merged with the active-contract box — same look as the contracts billboard.
export default function ActiveContractBoard() {
  const { contract } = useActiveContract();
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => { setToday(new Date()); }, []);

  if (contract === undefined || !today) {
    return <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50">Loading…</div>;
  }
  if (!contract) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 text-sm dark:border-red-800 dark:bg-red-950/20">
        <strong>No contract selected.</strong> Pick one to start counting days on board.
        <Link href="/contracts" className="ml-2 rounded-full bg-stone-900 px-3 py-1 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Select contract</Link>
      </div>
    );
  }

  const days = contractDays(contract, today) ?? 0;
  const estEnd = contract.estimatedEndDate ? parseDate(contract.estimatedEndDate) : null;
  const left = estEnd ? Math.ceil((estEnd.getTime() - today.getTime()) / 86400000) : null;

  return (
    <div className="rounded-3xl border-2 border-amber-300 bg-stone-900 p-5 text-amber-50 dark:border-red-800 dark:bg-black dark:text-red-200">
      <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">On board — {contract.shipName} ({contract.rank})</div>
          <div className="text-4xl font-black">Day {days}</div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest opacity-70">Est. sign-off</div>
          {left !== null ? (
            <div className={`text-4xl font-black ${left <= 14 ? "text-red-400" : ""}`}>{left < 0 ? `${-left} over` : `${left} left`}</div>
          ) : (
            <Link href="/contracts#est-signoff" className="text-sm font-bold underline">Set date in Contracts →</Link>
          )}
        </div>
        <div className="text-sm font-medium opacity-80">
          {contract.shipType} • joined {contract.signOnDate} at {contract.joinPort || "—"}
          {contract.estimatedEndDate ? ` • est. ${contract.estimatedEndDate}` : ""}
        </div>
      </div>
    </div>
  );
}
