import { NextRequest, NextResponse } from "next/server";
import { serverAdminTracker } from "@/lib/server-admin-tracker";
import {
  getSession,
  getCookieNames,
  getSecurityHeaders,
  verifyCsrfToken,
  hasPermission,
  logSecurityEvent,
  getClientIp,
} from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const cookieNames = getCookieNames();
    const sessionCookie =
      req.cookies.get(cookieNames.primary)?.value ||
      req.cookies.get(cookieNames.fallback)?.value;

    const session = getSession(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to access administrative metrics.", code: "UNAUTHORIZED" },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    if (!hasPermission(session.role, "metrics:read")) {
      return NextResponse.json(
        { error: "Forbidden: insufficient role permissions.", code: "FORBIDDEN" },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const userId = req.nextUrl.searchParams.get("userId");
    if (userId) {
      const detail = serverAdminTracker.getUserDetail(userId);
      if (!detail) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
      const response = NextResponse.json({
        success: true,
        user: detail.user,
        stats: detail.stats,
        logs: detail.logs,
        role: session.role,
        timestamp: new Date().toISOString(),
      });
      const headers = getSecurityHeaders();
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      return response;
    }

    const users = serverAdminTracker.getUsers();
    const metrics = serverAdminTracker.getMetrics();
    const logs = serverAdminTracker.getLogs(60);

    const response = NextResponse.json({
      success: true,
      users,
      metrics,
      logs,
      role: session.role,
      user: session.username,
      timestamp: new Date().toISOString(),
    });

    const headers = getSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve admin metrics";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const cookieNames = getCookieNames();
    const sessionCookie =
      req.cookies.get(cookieNames.primary)?.value ||
      req.cookies.get(cookieNames.fallback)?.value;

    const session = getSession(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to execute admin actions.", code: "UNAUTHORIZED" },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Anti-CSRF Token Validation
    const csrfHeader = req.headers.get("x-csrf-token");
    if (!verifyCsrfToken(session.csrfToken, csrfHeader)) {
      logSecurityEvent({
        event: "csrf_failure",
        ipAddress: clientIp,
        userAgent,
        username: session.username,
        role: session.role,
        details: "Mutating request rejected due to invalid anti-CSRF token.",
      });

      return NextResponse.json(
        { error: "Security validation error: invalid CSRF token.", code: "CSRF_FAILED" },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "simulate") {
      if (!hasPermission(session.role, "simulate:write")) {
        return NextResponse.json(
          { error: "Forbidden: role does not permit running simulated test requests.", code: "FORBIDDEN" },
          { status: 403, headers: getSecurityHeaders() }
        );
      }

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

      const response = NextResponse.json({
        success: true,
        message: "Simulated request tracked successfully",
        log: simulatedLog,
      });

      const headers = getSecurityHeaders();
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }

      return response;
    }

    if (action === "reset") {
      if (!hasPermission(session.role, "data:reset")) {
        return NextResponse.json(
          { error: "Forbidden: Super Administrator role required to reset tracking baseline.", code: "FORBIDDEN" },
          { status: 403, headers: getSecurityHeaders() }
        );
      }

      serverAdminTracker.resetData();

      const response = NextResponse.json({
        success: true,
        message: "Admin metrics reset to baseline successfully",
      });

      const headers = getSecurityHeaders();
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }

      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400, headers: getSecurityHeaders() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to execute admin action";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
