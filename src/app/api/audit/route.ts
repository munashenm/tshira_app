import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    const history = await prisma.caseHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { name: true, role: true } },
        case: { select: { clientName: true, nydaReference: true } }
      }
    });

    return NextResponse.json(history);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
