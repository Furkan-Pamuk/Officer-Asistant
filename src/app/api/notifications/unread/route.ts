import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    unreadCount: 0,
    timestamp: new Date().toISOString(),
  });
}
