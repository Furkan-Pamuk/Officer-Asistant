import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSession,
  isIpAllowed,
  getClientIp,
  getSecurityHeaders,
  getCookieNames,
  logSecurityEvent,
} from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin and /api/admin paths
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request.headers);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // IP Whitelisting Check
  if (!isIpAllowed(clientIp)) {
    logSecurityEvent({
      event: "ip_blocked",
      ipAddress: clientIp,
      userAgent,
      details: `Request to ${pathname} rejected by IP whitelist policy.`,
    });

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Access forbidden: IP address not authorized.", code: "IP_FORBIDDEN" },
        { status: 403, headers: getSecurityHeaders() }
      );
    }

    return new NextResponse("Access forbidden: IP address not authorized.", {
      status: 403,
      headers: getSecurityHeaders(),
    });
  }

  // Public exceptions for admin authentication
  const isPublicAuthRoute =
    pathname === "/admin/login" ||
    pathname === "/api/admin/auth/login" ||
    pathname === "/api/admin/auth/status";

  if (isPublicAuthRoute) {
    const response = NextResponse.next();
    const headers = getSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Retrieve and verify session cookie
  const cookieNames = getCookieNames();
  const sessionCookie =
    request.cookies.get(cookieNames.primary)?.value ||
    request.cookies.get(cookieNames.fallback)?.value;

  const session = getSession(sessionCookie);

  if (!session) {
    logSecurityEvent({
      event: "unauthorized_access",
      ipAddress: clientIp,
      userAgent,
      details: `Unauthorized attempt to access ${pathname}.`,
    });

    // For API calls, return 401 Unauthorized
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Authentication required to access administrative API.", code: "UNAUTHORIZED" },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // For page navigation, redirect to direct admin login gateway
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authorized request: pass forward with security headers and session context
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Inject downstream context headers for handlers
  response.headers.set("x-admin-user", session.username);
  response.headers.set("x-admin-role", session.role);

  // Apply industry standard security headers
  const securityHeaders = getSecurityHeaders();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
