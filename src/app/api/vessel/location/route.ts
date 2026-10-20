import { NextResponse } from "next/server";
import { lookupVessel, legacyShape } from "@/lib/providers";

// Server-side proxy so provider keys never reach the browser.
// GET /api/vessel/location?imo=9247431 (legacy tracker shape)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
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
