import { NextResponse } from "next/server";
import { lookupVessel, vesselByMmsiFree, legacyShape } from "@/lib/providers";

// Server-side proxy so provider keys never reach the browser.
// GET /api/vessel/location?imo=9247431 (paid legacy tracker shape)
// GET /api/vessel/location?mmsi=636026627 (free Open Waters detail)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mmsi = searchParams.get("mmsi") ?? "";
  if (/^\d{9}$/.test(mmsi)) {
    const r = await vesselByMmsiFree(mmsi);
    if (!r.ok) {
      const s = r.error.kind === "invalid" ? 400 : r.error.kind === "rate-limited" ? 429 : r.error.kind === "not-found" ? 404 : 502;
      return NextResponse.json({ error: r.error.message }, { status: s });
    }
    return NextResponse.json({ ...legacyShape(r.data), attribution: r.attribution });
  }
  const imo = searchParams.get("imo") ?? "";
  const r = await lookupVessel(imo);
  if (!r.ok) {
    if (r.error.kind === "invalid") return NextResponse.json({ error: r.error.message }, { status: 400 });
    if (r.error.kind === "credits") return NextResponse.json({ error: r.error.message }, { status: 403 });
    if (r.error.kind === "rate-limited") return NextResponse.json({ error: r.error.message }, { status: 429 });
    if (r.error.kind === "not-found") return NextResponse.json({ error: r.error.message }, { status: 404 });
    return NextResponse.json({ error: r.error.message }, { status: 502 });
  }
  return NextResponse.json(legacyShape(r.data));
}
