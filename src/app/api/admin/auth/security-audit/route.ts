import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  getCookieNames,
  getSecurityHeaders,
  getSecurityAuditLogs,
  hasPermission,
} from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const cookieNames = getCookieNames();
  const sessionCookie =
    req.cookies.get(cookieNames.primary)?.value ||
    req.cookies.get(cookieNames.fallback)?.value;

  const session = getSession(sessionCookie);

  if (!session) {
    return NextResponse.json(
      { error: "Authentication required", code: "UNAUTHORIZED" },
      { status: 401, headers: getSecurityHeaders() }
    );
  }

  if (!hasPermission(session.role, "audit:export")) {
    return NextResponse.json(
      { error: "Forbidden: insufficient role permissions to view security audit stream.", code: "FORBIDDEN" },
      { status: 403, headers: getSecurityHeaders() }
    );
  }

  const logs = getSecurityAuditLogs(60);

  const response = NextResponse.json({
    success: true,
    logs,
  });

  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
