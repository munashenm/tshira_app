import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionActorFromCookies } from "@/lib/session";

export async function GET() {
  try {
    const sessionActor = await getSessionActorFromCookies();
    if (!sessionActor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionActor.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        province: true,
        active: true,
      },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

