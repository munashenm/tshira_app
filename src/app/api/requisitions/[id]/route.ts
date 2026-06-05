import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RequisitionStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";
import { sendNotification, notificationTemplates } from "@/lib/notifications";

const APPROVAL_STATUSES: RequisitionStatus[] = [
  RequisitionStatus.APPROVED,
  RequisitionStatus.REJECTED,
  RequisitionStatus.BOOKED,
];

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
      include: {
        client: true,
        dco: { select: { id: true, name: true, email: true, phone: true } },
        user: { select: { name: true } },
      },
    });

    if (!current) return NextResponse.json({ error: "Requisition not found" }, { status: 404 });

    const { status } = body;
    const nextStatus = status as RequisitionStatus;
    const isApprovalTransition = APPROVAL_STATUSES.includes(nextStatus);

    if (isApprovalTransition) {
      if (nextStatus === RequisitionStatus.APPROVED || nextStatus === RequisitionStatus.REJECTED) {
        const adminError = requireRoles(auth.context, [Role.ADMIN_OFFICER]);
        if (adminError) return adminError;
        if (current.status !== RequisitionStatus.SUBMITTED) {
          return NextResponse.json({ error: "Admin can only approve submitted requisitions." }, { status: 400 });
        }
      }

      if (nextStatus === RequisitionStatus.BOOKED) {
        const financeError = requireRoles(auth.context, [Role.FINANCE]);
        if (financeError) return financeError;
        if (current.status !== RequisitionStatus.APPROVED) {
          return NextResponse.json({ error: "Finance can only confirm requisitions after admin approval." }, { status: 400 });
        }
      }
    } else if (auth.context.actor.id !== current.userId && auth.context.actor.role !== Role.ADMIN_OFFICER) {
      return NextResponse.json({ error: "Forbidden: only owner or admin can update this requisition." }, { status: 403 });
    }

    const dataToUpdate: Record<string, unknown> = { status: nextStatus };
    if (nextStatus === RequisitionStatus.APPROVED || nextStatus === RequisitionStatus.REJECTED) {
      dataToUpdate.approvedById = auth.context.actor.id;
    }
    if (nextStatus === RequisitionStatus.BOOKED) {
      dataToUpdate.financeApprovedById = auth.context.actor.id;
    }

    const requisition = await prisma.requisition.update({
      where: { id },
      data: dataToUpdate,
      include: {
        client: true,
        dco: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (nextStatus === RequisitionStatus.BOOKED) {
      const voucherCase = requisition.clientId
        ? await prisma.case.findFirst({
            where: { clientId: requisition.clientId },
            orderBy: { createdAt: "desc" },
            select: { voucherAppNumber: true, nydaReference: true },
          })
        : null;
      const voucherNumber = voucherCase?.voucherAppNumber || voucherCase?.nydaReference || "N/A";
      const contactDetails = [
        requisition.client?.phone && `Phone: ${requisition.client.phone}`,
        requisition.client?.email && `Email: ${requisition.client.email}`,
        requisition.client?.address && `Address: ${requisition.client.address}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const meetingDate = new Date(requisition.dateTime).toLocaleDateString("en-ZA", { dateStyle: "long" });
      const meetingTime = requisition.meetingTime || new Date(requisition.dateTime).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

      const message = notificationTemplates.requisitionConfirmed({
        clientName: requisition.client?.name || "N/A",
        voucherNumber,
        contactDetails: contactDetails || "N/A",
        meetingDate,
        meetingTime,
        meetingReference: requisition.meetingReference || requisition.location,
      });

      const notifyTarget = requisition.dco;
      if (notifyTarget?.email) {
        await sendNotification({
          to: notifyTarget.email,
          name: notifyTarget.name || "Data Collection Officer",
          type: "BOTH",
          message,
        });
      } else {
        const provinceDcos = await prisma.user.findMany({
          where: {
            role: Role.DATA_COLLECTION_OFFICER,
            active: true,
            OR: [
              { province: requisition.province },
              { provinceAssignments: { some: { province: requisition.province } } },
            ],
          },
          select: { email: true, name: true },
        });
        for (const dco of provinceDcos) {
          if (dco.email) {
            await sendNotification({
              to: dco.email,
              name: dco.name || "Data Collection Officer",
              type: "EMAIL",
              message,
            });
          }
        }
      }

      await prisma.notification.create({
        data: {
          userId: requisition.dcoId,
          type: "REQUISITION",
          message,
        },
      });
    }

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error updating requisition:", error);
    return NextResponse.json({ error: "Failed to update requisition" }, { status: 500 });
  }
}
