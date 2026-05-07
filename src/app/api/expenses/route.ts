import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        case: { select: { clientName: true, nydaReference: true } }
      }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, category, description, caseId, userId } = body;

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        description,
        caseId: caseId || null,
        userId: userId || "system", // Fallback
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
