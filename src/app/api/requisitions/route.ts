import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RequisitionStatus } from "@prisma/client";

export async function GET() {
  const requisitions = await prisma.requisition.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(requisitions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { province, location, dateTime, purpose, isClientVisit, estimatedCost, userId } = body;

    // For demo purposes, we'll use a fixed user ID if none provided
    // In a real app, this would come from Auth session
    let actualUserId = userId;
    if (!actualUserId || actualUserId === "demo-user-id") {
      const demoUser = await prisma.user.findFirst({
        where: { role: 'PROVINCIAL_COORDINATOR' }
      });
      actualUserId = demoUser?.id;
    }

    if (!actualUserId) {
        return NextResponse.json({ error: "No suitable user found for assignment" }, { status: 400 });
    }

    const requisition = await prisma.requisition.create({
      data: {
        province,
        location,
        dateTime: new Date(dateTime),
        purpose,
        isClientVisit,
        estimatedCost,
        userId: actualUserId,
        status: RequisitionStatus.SUBMITTED
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error creating requisition:", error);
    return NextResponse.json({ error: "Failed to create requisition" }, { status: 500 });
  }
}
