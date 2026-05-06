import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RequisitionStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approvedById } = body;

    const requisition = await prisma.requisition.update({
      where: { id },
      data: {
        status: status as RequisitionStatus,
        approvedById
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error updating requisition:", error);
    return NextResponse.json({ error: "Failed to update requisition" }, { status: 500 });
  }
}
