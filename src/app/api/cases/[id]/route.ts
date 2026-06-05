import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { CaseStatus, Role } from "@prisma/client";
import { sendNotification, notificationTemplates } from "@/lib/notifications";
import { requireActor, requireRoles, validateAssignmentPermission, validateStatusTransition } from "@/lib/authz";
import { canAccessProvince } from "@/lib/provinces";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workCase = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        coordinator: { select: { name: true, email: true } },
        dco: { select: { name: true, email: true } },
        consultant: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } },
        history: { orderBy: { createdAt: 'asc' } },
        documents: true,
      },
    });
    if (!workCase) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(workCase);
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const { 
      status, 
      coordinatorId, 
      dcoId, 
      consultantId, 
      reviewerId, 
      comments,
      beneficiaryDetails,
      idNumber,
      phone,
      businessData,
      invoiceNumber,
      invoiceDate,
      actualCost,
      userId,
      adminOffice,
      voucherAppNumber,
      dateAllocatedToCoordinator,
      dateAllocatedToConsultant,
      dateCompleted,
      clientUpdate,
      acceptAssignment // true for accept, false for decline
    } = body;

    const targetCase = await prisma.case.findUnique({
      where: { id },
      select: { id: true, status: true, province: true, coordinatorId: true, dcoId: true, consultantId: true, reviewerId: true },
    });

    if (!targetCase) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (auth.context.actor.role === Role.PROVINCIAL_COORDINATOR) {
      const actorUser = await prisma.user.findUnique({
        where: { id: auth.context.actor.id },
        select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
      });
      if (actorUser && !canAccessProvince(actorUser, targetCase.province)) {
        return NextResponse.json({ error: "Forbidden: coordinator can only update cases in their assigned provinces." }, { status: 403 });
      }
    }

    const assignmentFields: Array<"coordinatorId" | "dcoId" | "consultantId" | "reviewerId"> = [];
    if (coordinatorId !== undefined) assignmentFields.push("coordinatorId");
    if (dcoId !== undefined) assignmentFields.push("dcoId");
    if (consultantId !== undefined) assignmentFields.push("consultantId");
    if (reviewerId !== undefined) assignmentFields.push("reviewerId");

    if (assignmentFields.length > 0) {
      const assignmentError = validateAssignmentPermission(auth.context, assignmentFields);
      if (assignmentError) return assignmentError;
    }

    if (status) {
      const statusError = validateStatusTransition(auth.context, targetCase.status, status as CaseStatus);
      if (statusError) return statusError;
    }

    const roleErrorForFinancialUpdates =
      (invoiceNumber !== undefined || invoiceDate !== undefined || actualCost !== undefined) &&
      requireRoles(auth.context, [Role.FINANCE, Role.ADMIN_OFFICER]);
    if (roleErrorForFinancialUpdates) return roleErrorForFinancialUpdates;

    const dataToUpdate: any = {
      status: status as CaseStatus,
      coordinatorId,
      dcoId,
      consultantId,
      reviewerId,
      comments,
      beneficiaryDetails,
      invoiceNumber,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
      actualCost,
      adminOffice,
      voucherAppNumber,
      dateAllocatedToCoordinator: dateAllocatedToCoordinator ? new Date(dateAllocatedToCoordinator) : undefined,
      dateAllocatedToConsultant: dateAllocatedToConsultant ? new Date(dateAllocatedToConsultant) : undefined,
      dateCompleted: dateCompleted ? new Date(dateCompleted) : undefined,
    };

    if (acceptAssignment !== undefined) {
      if (acceptAssignment === true) {
        if (targetCase.coordinatorId === auth.context.actor.id) dataToUpdate.coordinatorAcceptedAt = new Date();
        if (targetCase.dcoId === auth.context.actor.id) dataToUpdate.dcoAcceptedAt = new Date();
        if (targetCase.consultantId === auth.context.actor.id) dataToUpdate.consultantAcceptedAt = new Date();
      } else if (acceptAssignment === false) {
        // Decline
        if (targetCase.coordinatorId === auth.context.actor.id) dataToUpdate.coordinatorId = null;
        if (targetCase.dcoId === auth.context.actor.id) dataToUpdate.dcoId = null;
        if (targetCase.consultantId === auth.context.actor.id) dataToUpdate.consultantId = null;
      }
    }

    // First update the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...dataToUpdate,
        history: status ? {
          create: {
            status: status as CaseStatus,
            comments: comments || "Status updated",
            userId: userId || auth.context.actor.id
          }
        } : undefined,
        // Update the client if business data is provided
        client: (businessData || idNumber || phone || clientUpdate) ? {
          update: {
            idNumber,
            phone,
            ...businessData,
            ...clientUpdate
          }
        } : undefined
      },
      include: {
        coordinator: true,
        dco: true,
        consultant: true,
        reviewer: true,
        client: true
      }
    });

    // Handle Notifications
    const ref = updatedCase.nydaReference || updatedCase.id;

    // 1. Assignment Notifications
    if (coordinatorId && updatedCase.coordinator) {
      await sendNotification({
        to: updatedCase.coordinator.email || "",
        name: updatedCase.coordinator.name || "Coordinator",
        type: "BOTH",
        caseRef: ref,
        message: notificationTemplates.caseAssigned("Provincial Coordinator", ref)
      });
    }
    if (dcoId && updatedCase.dco) {
      await sendNotification({
        to: updatedCase.dco.email || "",
        name: updatedCase.dco.name || "Field Officer",
        type: "BOTH",
        caseRef: ref,
        message: notificationTemplates.caseAssigned("Data Collection Officer", ref)
      });
    }
    if (consultantId && updatedCase.consultant) {
      await sendNotification({
        to: updatedCase.consultant.email || "",
        name: updatedCase.consultant.name || "Consultant",
        type: "BOTH",
        caseRef: ref,
        message: notificationTemplates.caseAssigned("Business Consultant", ref)
      });
    }

    // 2. Status & Review Notifications
    if (status) {
      if (status.includes("RETURNED")) {
        // Notify consultant or DCO about corrections
        const targetUser = status.includes("DATA") ? updatedCase.dco : updatedCase.consultant;
        if (targetUser) {
          await sendNotification({
            to: targetUser.email || "",
            name: targetUser.name || "User",
            type: "BOTH",
            caseRef: ref,
            message: notificationTemplates.returnedForCorrection(ref, comments || "")
          });
        }
      } else {
        // General status update for head office / coordinator
        console.log(`System Notification: Project ${ref} status is now ${status}`);
      }
    }

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}
