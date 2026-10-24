import { NextRequest, NextResponse } from "next/server";
import { destroyUserSession, USER_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(USER_COOKIE_NAME)?.value;

  if (sessionCookie) {
    destroyUserSession(sessionCookie);
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.delete(USER_COOKIE_NAME);

  return response;
}
