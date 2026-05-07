import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activity = await prisma.caseHistory.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          select: {
            clientName: true,
            nydaReference: true,
            id: true
          }
        },
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Activity feed error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
