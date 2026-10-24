import { NextRequest, NextResponse } from "next/server";
import {
  getSession,
  getCookieNames,
  getSecurityHeaders,
  getMfaSetupInfo,
  getAdminConfig,
} from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const cookieNames = getCookieNames();
  const sessionCookie =
    req.cookies.get(cookieNames.primary)?.value ||
    req.cookies.get(cookieNames.fallback)?.value;

  const session = getSession(sessionCookie);

  const response = NextResponse.json({
    authenticated: !!session,
    user: session
      ? {
          username: session.username,
          role: session.role,
        }
      : null,
    csrfToken: session?.csrfToken || null,
    mfaInfo: getMfaSetupInfo(),
    securityConfig: getAdminConfig(),
  });

  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
