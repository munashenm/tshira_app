import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { CaseStatus } from "@prisma/client";
import { sendNotification, notificationTemplates } from "@/lib/notifications";

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
    const { 
      status, 
      coordinatorId, 
      dcoId, 
      consultantId, 
      reviewerId, 
      comments,
      beneficiaryDetails,
      invoiceNumber,
      invoiceDate,
      actualCost,
      userId
    } = body;

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
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
        history: status ? {
          create: {
            status: status as CaseStatus,
            comments: comments || "Status updated",
            userId: userId
          }
        } : undefined
      },
      include: {
        coordinator: true,
        dco: true,
        consultant: true,
        reviewer: true
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
