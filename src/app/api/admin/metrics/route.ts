import { NextRequest, NextResponse } from "next/server";
import { serverAdminTracker } from "@/lib/server-admin-tracker";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (userId) {
      const detail = serverAdminTracker.getUserDetail(userId);
      if (!detail) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        user: detail.user,
        stats: detail.stats,
        logs: detail.logs,
        timestamp: new Date().toISOString(),
      });
    }

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve admin metrics";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "simulate") {
      const isFailed = body.status === "failed";
      const simulatedLog = serverAdminTracker.trackApiRequest({
        userId: body.userId || "usr_cadet",
        userName: body.userName || "Leo Miller",
        userRank: body.userRank || "Deck Cadet",
        vessel: body.vessel || "M/V Pacific Horizon",
        endpoint: "/api/requests/ai-identify",
        status: body.status || "success",
        model: "gemini-2.0-flash",
        latencyMs: Math.floor(450 + Math.random() * 400),
        productId: isFailed ? undefined : body.productId || "791821",
        productName: isFailed ? undefined : body.productName || "CHIPPING HAMMER STEEL HANDLE 500G",
        category: isFailed ? undefined : body.category || "spare-deck",
        errorMessage: body.errorMessage,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute admin action";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
