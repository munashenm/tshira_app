import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RequisitionStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const current = await prisma.requisition.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!current) return NextResponse.json({ error: "Requisition not found" }, { status: 404 });

    const { status, approvedById } = body;
    const nextStatus = status as RequisitionStatus;

    if ([RequisitionStatus.APPROVED, RequisitionStatus.REJECTED, RequisitionStatus.BOOKED].includes(nextStatus)) {
      const approverRoleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.FINANCE]);
      if (approverRoleError) return approverRoleError;
    } else if (auth.context.actor.id !== current.userId && auth.context.actor.role !== Role.ADMIN_OFFICER) {
      return NextResponse.json({ error: "Forbidden: only owner or admin can update this requisition." }, { status: 403 });
    }

    const requisition = await prisma.requisition.update({
      where: { id },
      data: {
        status: status as RequisitionStatus,
        approvedById: approvedById || (
          [RequisitionStatus.APPROVED, RequisitionStatus.REJECTED, RequisitionStatus.BOOKED].includes(nextStatus)
            ? auth.context.actor.id
            : undefined
        )
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error updating requisition:", error);
    return NextResponse.json({ error: "Failed to update requisition" }, { status: 500 });
  }
}
