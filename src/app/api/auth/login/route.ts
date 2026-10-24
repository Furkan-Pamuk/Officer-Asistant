import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  createUserSession,
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginFailures,
  getClientIp,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  // Rate limit check
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed attempts. Try again in ${rateLimit.retryAfter} seconds.`,
        code: "RATE_LIMITED",
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": rateLimit.retryAfter.toString(),
        },
      },
    );
  }

  try {
    const body = await req.json();
    const { email = "", password = "" } = body;

    const result = authenticateUser(email, password);

    if (!result.success) {
      recordLoginFailure(clientIp);
      return NextResponse.json(
        { success: false, error: result.error, code: "INVALID_CREDENTIALS" },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const user = result.user!;
    clearLoginFailures(clientIp);

    const { cookieValue } = createUserSession(user.id, user.email, user.displayName);

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      },
      { headers: { "Cache-Control": "no-store" } },
    );

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication processing error";
    return NextResponse.json(
      { success: false, error: message, code: "AUTH_ERROR" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
