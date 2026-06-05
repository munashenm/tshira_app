import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";
import { provinceWhereClause } from "@/lib/provinces";
import { sendNotification, notificationTemplates } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER]);
    if (roleError) return roleError;

    const body = await request.json();
    const { name, idNumber, phone, address, province, email, companyName, ckNumber, tradingName } = body;

    if (!name || !idNumber || !province) {
      return NextResponse.json({ error: "Name, ID Number and Province are required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        idNumber,
        phone,
        address,
        province: province as Province,
        email,
        companyName,
        ckNumber,
        tradingName,
      },
    });

    if (email) {
      await sendNotification({
        to: email,
        name: name,
        type: "EMAIL",
        message: notificationTemplates.clientRegistered(name)
      });
    }

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Error creating client:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A client with this ID number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const actorUser = await prisma.user.findUnique({
      where: { id: auth.context.actor.id },
      select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
    });
    const provinceFilter = actorUser ? provinceWhereClause(actorUser) : {};

    const clients = await prisma.client.findMany({
      where: provinceFilter,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
