import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province } from "@prisma/client";

export async function POST(request: Request) {
  try {
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

    return NextResponse.json(newCase);
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
