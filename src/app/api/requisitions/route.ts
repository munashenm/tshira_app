import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, RequisitionStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";
import { canAccessProvince, provinceWhereClause } from "@/lib/provinces";

export async function GET(request: Request) {
  const auth = await requireActor(request);
  if (!auth.ok) return auth.response;

  const actorWithProvinces = await prisma.user.findUnique({
    where: { id: auth.context.actor.id },
    select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
  });
  const whereClause = actorWithProvinces ? provinceWhereClause(actorWithProvinces) : {};

  const requisitions = await prisma.requisition.findMany({
    where: whereClause,
    include: { user: true, client: true, dco: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requisitions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.PROVINCIAL_COORDINATOR, Role.DATA_COLLECTION_OFFICER]);
    if (roleError) return roleError;

    const { province, location, dateTime, meetingTime, meetingReference, purpose, isClientVisit, estimatedCost, clientId, dcoId } = body;

    const actorWithProvinces = await prisma.user.findUnique({
      where: { id: auth.context.actor.id },
      select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
    });

    if (actorWithProvinces && !canAccessProvince(actorWithProvinces, province as Province)) {
      return NextResponse.json({ error: "Forbidden: you can only create requisitions in your assigned provinces." }, { status: 403 });
    }

    if (isClientVisit) {
      if (!clientId) {
        return NextResponse.json({ error: "Client selection is required for client visits." }, { status: 400 });
      }
      if (!dcoId) {
        return NextResponse.json({ error: "A Data Collection Officer must be assigned for client visits." }, { status: 400 });
      }
      if (!meetingReference?.trim()) {
        return NextResponse.json({ error: "Meeting venue reference number is required for client visits." }, { status: 400 });
      }

      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: "Selected client not found." }, { status: 400 });
      }
      if (client.province !== province) {
        return NextResponse.json({ error: "Client must belong to the selected province." }, { status: 400 });
      }

      const dco = await prisma.user.findFirst({
        where: {
          id: dcoId,
          role: Role.DATA_COLLECTION_OFFICER,
          active: true,
          OR: [
            { province: province as Province },
            { provinceAssignments: { some: { province: province as Province } } },
          ],
        },
      });
      if (!dco) {
        return NextResponse.json({ error: "Selected DCO is not assigned to this province." }, { status: 400 });
      }
    }

    const requisition = await prisma.requisition.create({
      data: {
        province,
        location,
        dateTime: new Date(dateTime),
        meetingTime: meetingTime || null,
        meetingReference: meetingReference || null,
        purpose,
        isClientVisit,
        estimatedCost,
        clientId: isClientVisit ? clientId : null,
        dcoId: isClientVisit ? dcoId : null,
        userId: auth.context.actor.id,
        status: RequisitionStatus.SUBMITTED,
      },
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error creating requisition:", error);
    return NextResponse.json({ error: "Failed to create requisition" }, { status: 500 });
  }
}
