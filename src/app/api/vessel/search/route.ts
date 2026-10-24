import { NextResponse } from "next/server";
import { searchVesselsFree } from "@/lib/providers";

// Server-side proxy for free AIS name search (no key needed, keeps
// flood control + shape normalization server-side).
// GET /api/vessel/search?q=ever%20given -> { candidates: [{mmsi,name,seen}] }
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get("q");

  if (rawQ === null) {
    return NextResponse.json({ error: "Query parameter 'q' is required." }, { status: 400 });
  }

  if (/[\u0000-\u001F\u007F-\u009F]/.test(rawQ)) {
    return NextResponse.json({ error: "Query must not contain control characters." }, { status: 400 });
  }

  const q = rawQ.trim();
  if (q.length < 2 || q.length > 60) {
    return NextResponse.json(
      { error: "Query length must be between 2 and 60 characters." },
      { status: 400 }
    );
  }

  const r = await searchVesselsFree(q);
  if (!r.ok) {
    const s = r.error.kind === "invalid" ? 400 : r.error.kind === "rate-limited" ? 429 : 502;
    return NextResponse.json({ error: r.error.message }, { status: s });
  }
  return NextResponse.json({ candidates: r.candidates, attribution: r.attribution });
}
