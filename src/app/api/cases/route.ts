import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function GET(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const whereClause: any = {};
    if (auth.context.actor.role === Role.PROVINCIAL_COORDINATOR && auth.context.actor.province) {
      whereClause.province = auth.context.actor.province;
    } else if (auth.context.actor.role === Role.DATA_COLLECTION_OFFICER && auth.context.actor.province) {
      whereClause.province = auth.context.actor.province;
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      include: {
        client: true,
        coordinator: { select: { id: true, name: true, email: true } },
        dco: { select: { id: true, name: true, email: true } },
        consultant: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.PROVINCIAL_COORDINATOR]);
    if (roleError) return roleError;

    const formData = await request.formData();
    const nydaReference = formData.get("nydaReference") as string;
    const clientName = formData.get("clientName") as string;
    const province = formData.get("province") as Province;
    const outputType = formData.get("outputType") as string;
    const priority = (formData.get("priority") as string) || "NORMAL";
    const deadlineStr = formData.get("deadline") as string;
    const beneficiaryDetails = formData.get("beneficiaryDetails") as string;
    
    const deadline = deadlineStr ? new Date(deadlineStr) : null;
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + 7); // Default 7-day SLA

    const idNumber = formData.get("idNumber") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;

    // Find or Create Client
    let client = await prisma.client.findUnique({
      where: { idNumber }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          idNumber,
          phone,
          email,
          address,
          province
        }
      });
    }

    const newCase = await prisma.case.create({
      data: {
        nydaReference,
        clientName,
        beneficiaryDetails,
        province,
        outputType,
        priority,
        deadline,
        slaDeadline,
        clientId: client.id,
        status: "RECEIVED_FROM_NYDA",
      },
    });

    const docFile = formData.get("document") as File;
    if (docFile && docFile.name) {
      await prisma.document.create({
        data: {
          caseId: newCase.id,
          type: "NYDA_INFLOW_DOCUMENT",
          name: docFile.name,
          url: `/uploads/${docFile.name}`, // Placeholder path
          uploadedBy: "NYDA_INTAKE"
        }
      });
    }

    return NextResponse.json(newCase);
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
