import { NextRequest, NextResponse } from "next/server";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
  verifyUsername,
  verifyPassword,
  verifyMfaCode,
  createSession,
  getClientIp,
  getSecurityHeaders,
  getCookieNames,
  AdminRole,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);
  const userAgent = req.headers.get("user-agent") || "unknown";

  // Rate Limiting & Brute-Force Check
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Access locked. Try again in ${rateLimit.remainingSeconds} seconds.`,
        code: "RATE_LIMITED",
        retryAfter: rateLimit.remainingSeconds,
      },
      {
        status: 429,
        headers: {
          ...getSecurityHeaders(),
          "Retry-After": rateLimit.remainingSeconds.toString(),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { username = "", password = "", mfaCode = "", role = "super_admin" } = body;

    // Verify Username
    if (!verifyUsername(username)) {
      const failure = recordLoginFailure(clientIp, userAgent, username);
      return NextResponse.json(
        {
          error: "Invalid admin credentials.",
          code: "INVALID_CREDENTIALS",
          locked: failure.locked,
          remainingAttempts: Math.max(0, 5 - failure.attempts),
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify Password
    if (!verifyPassword(password)) {
      const failure = recordLoginFailure(clientIp, userAgent, username);
      return NextResponse.json(
        {
          error: "Invalid admin credentials.",
          code: "INVALID_CREDENTIALS",
          locked: failure.locked,
          remainingAttempts: Math.max(0, 5 - failure.attempts),
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Verify MFA Passcode
    if (!verifyMfaCode(mfaCode)) {
      const failure = recordLoginFailure(clientIp, userAgent, username);
      return NextResponse.json(
        {
          error: "Invalid Multi-Factor Authentication (MFA) passcode or expired code.",
          code: "INVALID_MFA",
          locked: failure.locked,
          remainingAttempts: Math.max(0, 5 - failure.attempts),
        },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    // Valid role check
    const validRoles: AdminRole[] = ["super_admin", "operator_admin", "viewer_admin"];
    const assignedRole: AdminRole = validRoles.includes(role) ? role : "operator_admin";

    // Successful authentication
    recordLoginSuccess(clientIp);

    const { session, cookieValue } = createSession({
      username: username.trim(),
      role: assignedRole,
      ipAddress: clientIp,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        username: session.username,
        role: session.role,
      },
      csrfToken: session.csrfToken,
    });

    // Apply security headers
    const headers = getSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }

    // Set secure HTTP-only session cookie
    const cookieNames = getCookieNames();
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: cookieNames.primary,
      value: cookieValue,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication processing error";
    return NextResponse.json(
      { error: message, code: "AUTH_ERROR" },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}
