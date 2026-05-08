import { NextResponse } from "next/server";
import { getSessionCookieConfig, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieConfig(),
    maxAge: 0,
  });
  return response;
}

