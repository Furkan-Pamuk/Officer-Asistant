import { NextRequest, NextResponse } from "next/server";
import { getUserSession, USER_COOKIE_NAME } from "@/lib/user-auth";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(USER_COOKIE_NAME)?.value;
  const session = getUserSession(sessionCookie);

  return NextResponse.json(
    {
      authenticated: !!session,
      user: session
        ? {
            id: session.userId,
            email: session.email,
            displayName: session.displayName,
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
