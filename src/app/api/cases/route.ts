import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nydaReference = formData.get("nydaReference") as string;
    const clientName = formData.get("clientName") as string;
    const province = formData.get("province") as Province;
    const priority = (formData.get("priority") as string) || "NORMAL";
    const deadlineStr = formData.get("deadline") as string;
    const beneficiaryDetails = formData.get("beneficiaryDetails") as string;
    
    const deadline = deadlineStr ? new Date(deadlineStr) : null;
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + 7); // Default 7-day SLA

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
        status: "RECEIVED_FROM_NYDA",
      },
    });

    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
