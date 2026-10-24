import { NextRequest, NextResponse } from "next/server";
import { destroySession, getCookieNames, getSecurityHeaders } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const cookieNames = getCookieNames();
  const sessionCookie =
    req.cookies.get(cookieNames.primary)?.value ||
    req.cookies.get(cookieNames.fallback)?.value;

  if (sessionCookie) {
    destroySession(sessionCookie);
  }

  const response = NextResponse.json({
    success: true,
    message: "Admin session gracefully terminated.",
  });

  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  // Clear session cookies
  response.cookies.delete(cookieNames.primary);
  response.cookies.delete(cookieNames.fallback);

  return response;
}
