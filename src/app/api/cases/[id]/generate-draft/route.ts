import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workCase = await prisma.case.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!workCase) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    // Simulate AI generation of a Business Plan draft
    const draftName = `DRAFT_BP_${workCase.clientName.replace(/\s+/g, '_')}.pdf`;
    const draftContent = `
      NYDA BUSINESS PLAN DRAFT
      ------------------------
      Client: ${workCase.clientName}
      ID Number: ${workCase.client?.idNumber || "N/A"}
      Province: ${workCase.province}
      Project Type: ${workCase.outputType}
      
      SECTION 1: EXECUTIVE SUMMARY
      ${workCase.clientName} is a startup venture based in ${workCase.province}...
      
      [Auto-generated draft content based on beneficiary data...]
    `;

    // In a real app, we'd use a PDF library here.
    // For now, we'll create a record pointing to this "generated" file.
    const document = await prisma.document.create({
      data: {
        caseId: id,
        name: draftName,
        type: "Business Plan (AI Draft)",
        url: "#", // Mock URL
        uploadedBy: "System AI",
      }
    });

    await prisma.caseHistory.create({
      data: {
        caseId: id,
        status: "DOCUMENT_IN_PROGRESS",
        comments: `AI Draft generated for Business Plan.`,
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Draft generation error:", error);
    return NextResponse.json({ error: "Failed to generate draft" }, { status: 500 });
  }
}
