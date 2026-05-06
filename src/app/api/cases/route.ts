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

    const newCase = await prisma.case.create({
      data: {
        nydaReference,
        clientName,
        province,
        outputType,
        status: "RECEIVED_FROM_NYDA",
      },
    });

    return NextResponse.redirect(new URL("/", request.url), { status: 303 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}
