import { NextResponse } from "next/server";
import { searchVesselsFree } from "@/lib/providers";

// Server-side proxy for free AIS name search (no key needed, keeps
// flood control + shape normalization server-side).
// GET /api/vessel/search?q=ever%20given -> { candidates: [{mmsi,name,seen}] }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const r = await searchVesselsFree(q);
  if (!r.ok) {
    const s = r.error.kind === "invalid" ? 400 : r.error.kind === "rate-limited" ? 429 : 502;
    return NextResponse.json({ error: r.error.message }, { status: s });
  }
  return NextResponse.json({ candidates: r.candidates, attribution: r.attribution });
}
