import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RequisitionStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireActor(request);
  if (!auth.ok) return auth.response;

  const whereClause: any = {};
  if (auth.context.actor.role === Role.PROVINCIAL_COORDINATOR && auth.context.actor.province) {
    whereClause.province = auth.context.actor.province;
  } else if (auth.context.actor.role === Role.DATA_COLLECTION_OFFICER && auth.context.actor.province) {
    whereClause.province = auth.context.actor.province;
  }

  const requisitions = await prisma.requisition.findMany({
    where: whereClause,
    include: { user: true },
    orderBy: { createdAt: 'desc' }
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

    const { province, location, dateTime, purpose, isClientVisit, estimatedCost, clientId } = body;

    if (auth.context.actor.role === Role.PROVINCIAL_COORDINATOR && auth.context.actor.province && auth.context.actor.province !== province) {
      return NextResponse.json({ error: "Forbidden: coordinator can only create requisitions in their province." }, { status: 403 });
    }

    if (auth.context.actor.role === Role.DATA_COLLECTION_OFFICER && auth.context.actor.province && auth.context.actor.province !== province) {
      return NextResponse.json({ error: "Forbidden: DCO can only create requisitions in their province." }, { status: 403 });
    }

    const requisition = await prisma.requisition.create({
      data: {
        province,
        location,
        dateTime: new Date(dateTime),
        purpose,
        isClientVisit,
        estimatedCost,
        clientId: isClientVisit && clientId ? clientId : null,
        userId: auth.context.actor.id,
        status: RequisitionStatus.SUBMITTED
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error("Error creating requisition:", error);
    return NextResponse.json({ error: "Failed to create requisition" }, { status: 500 });
  }
}
