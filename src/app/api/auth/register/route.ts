import { NextRequest, NextResponse } from "next/server";
import {
  registerUser,
  createUserSession,
  checkRegisterRateLimit,
  recordRegisterAttempt,
  getClientIp,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req.headers);

  // Rate limiting check per IP (e.g. max 5 registrations per hour)
  const rateLimit = checkRegisterRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many registration attempts. Please try again in ${rateLimit.retryAfter} seconds.`,
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
    const { email = "", password = "", displayName = "" } = body;

    recordRegisterAttempt(clientIp);

    const result = registerUser(email, password, displayName);

    if (!result.success) {
      const isDuplicate = result.error?.includes("already exists");
      return NextResponse.json(
        { success: false, error: result.error },
        {
          status: isDuplicate ? 409 : 400,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const user = result.user!;
    const { cookieValue } = createUserSession(user.id, user.email, user.displayName);

    const response = NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, displayName: user.displayName } },
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
    const message = err instanceof Error ? err.message : "Registration processing error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
