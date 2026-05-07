import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const formType = searchParams.get("type");

  try {
    if (formType) {
      const response = await prisma.formResponse.findUnique({
        where: {
          caseId_formType: {
            caseId: id,
            formType,
          },
        },
      });
      return NextResponse.json(response);
    }

    const responses = await prisma.formResponse.findMany({
      where: { caseId: id },
    });
    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return NextResponse.json({ error: "Failed to fetch form responses" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { formType, data, submittedBy } = body;

  try {
    const response = await prisma.formResponse.upsert({
      where: {
        caseId_formType: {
          caseId: id,
          formType,
        },
      },
      update: {
        data,
        submittedBy,
      },
      create: {
        caseId: id,
        formType,
        data,
        submittedBy,
      },
    });

    // Also update the case status if needed
    if (formType === "BUSINESS_PLAN_QUESTIONNAIRE") {
      await prisma.case.update({
        where: { id },
        data: { status: "DATA_COLLECTION_IN_PROGRESS" }
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error saving form response:", error);
    return NextResponse.json({ error: "Failed to save form response" }, { status: 500 });
  }
}
