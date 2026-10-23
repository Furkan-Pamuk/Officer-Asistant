import { NextRequest, NextResponse } from "next/server";
import { serverAdminTracker } from "@/lib/server-admin-tracker";

export async function GET() {
  try {
    const users = serverAdminTracker.getUsers();
    const metrics = serverAdminTracker.getMetrics();
    const logs = serverAdminTracker.getLogs(60);

    return NextResponse.json({
      success: true,
      users,
      metrics,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve admin metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "simulate") {
      const simulatedLog = serverAdminTracker.trackApiRequest({
        userId: body.userId || "usr_cadet",
        userName: body.userName || "Leo Miller",
        userRank: body.userRank || "Deck Cadet",
        vessel: body.vessel || "M/V Pacific Horizon",
        endpoint: "/api/requests/ai-identify",
        status: body.status || "success",
        model: "gemini-2.0-flash",
        latencyMs: Math.floor(450 + Math.random() * 400),
        productId: body.productId || "791821",
        productName: body.productName || "CHIPPING HAMMER STEEL HANDLE 500G",
        category: body.category || "spare-deck",
        authMethod: "Google API Key (GEMINI_API_KEY)",
      });

      return NextResponse.json({
        success: true,
        message: "Simulated request tracked successfully",
        log: simulatedLog,
      });
    }

    if (action === "reset") {
      serverAdminTracker.resetData();
      return NextResponse.json({
        success: true,
        message: "Admin metrics reset to baseline successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to execute admin action" },
      { status: 500 }
    );
  }
}
