import { NextRequest, NextResponse } from "next/server";
import {
  registerUser,
  createUserSession,
  USER_COOKIE_NAME,
} from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = "", password = "", displayName = "" } = body;

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
