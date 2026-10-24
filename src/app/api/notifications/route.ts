import { NextResponse } from "next/server";

export interface ServerNotification {
  id: string;
  title: string;
  detail: string;
  level: "info" | "warning" | "alert";
  publishedAt: string;
}

// In-memory / server-side system broadcast registry
const SYSTEM_BROADCASTS: ServerNotification[] = [];

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    broadcasts: SYSTEM_BROADCASTS,
    unreadCount: SYSTEM_BROADCASTS.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "mark-all-read";

    return NextResponse.json({
      ok: true,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
