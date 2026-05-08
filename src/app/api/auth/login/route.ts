import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { createSessionCookieValue, getSessionCookieConfig, SESSION_COOKIE_NAME } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: "Account is inactive. Contact admin." }, { status: 403 });
    }

    if (!user.password.startsWith("$2")) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(password) },
      });
    }

    const sessionValue = await createSessionCookieValue({
      id: user.id,
      role: user.role,
      province: user.province ?? null,
    });

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      province: user.province,
    });
    response.cookies.set(SESSION_COOKIE_NAME, sessionValue, getSessionCookieConfig());
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
