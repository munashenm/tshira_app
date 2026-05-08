import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { CaseStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.PROVINCIAL_COORDINATOR]);
    if (roleError) return roleError;

    const { 
      caseIds, 
      status, 
      coordinatorId, 
      dcoId, 
      consultantId, 
      reviewerId,
      province,
      comments 
    } = body;

    if (!Array.isArray(caseIds) || caseIds.length === 0) {
      return NextResponse.json({ error: "No case IDs provided" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status as CaseStatus;
    if (coordinatorId) updateData.coordinatorId = coordinatorId;
    if (dcoId) updateData.dcoId = dcoId;
    if (consultantId) updateData.consultantId = consultantId;
    if (reviewerId) updateData.reviewerId = reviewerId;
    if (province) updateData.province = province;

    // Perform bulk update
    const result = await prisma.case.updateMany({
      where: {
        id: { in: caseIds }
      },
      data: updateData
    });

    // Create history records for each case (updateMany doesn't support nested creates)
    if (status || comments) {
      await prisma.caseHistory.createMany({
        data: caseIds.map(id => ({
          caseId: id,
          status: (status as CaseStatus) || "RECEIVED_FROM_NYDA", // Fallback or fetch current
          comments: comments || "Bulk update performed",
        }))
      });
    }

    return NextResponse.json({ 
      message: `Successfully updated ${result.count} cases`,
      count: result.count 
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to perform bulk update" }, { status: 500 });
  }
}
