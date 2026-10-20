"use client";
import Link from "next/link";
import { setActiveContractId } from "@/lib/db";
import { useActiveContract } from "@/hooks/useActiveContract";

export default function ContractBanner() {
  const { contract } = useActiveContract();
  if (contract === undefined) return null;
  if (!contract) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm dark:border-red-800 dark:bg-red-950/20">
        <strong>No contract selected.</strong> Create or pick a contract to keep each vessel&apos;s records separate.
        <Link href="/contracts" className="ml-2 rounded-full bg-stone-900 px-3 py-1 font-bold text-amber-50 dark:bg-red-700 dark:text-white">Select contract</Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-white p-3 text-sm dark:border-red-950 dark:bg-neutral-950">
      <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-50 dark:bg-red-700 dark:text-white">ACTIVE CONTRACT</span>
      <strong>{contract.shipName}</strong>
      <span className="text-stone-600 dark:text-red-300/70">{contract.shipType} • {contract.rank} • joined {contract.signOnDate} at {contract.joinPort}</span>
      <Link href="/contracts" className="ml-auto rounded-full border px-3 py-1 text-xs font-bold">Switch</Link>
    </div>
  );
}
