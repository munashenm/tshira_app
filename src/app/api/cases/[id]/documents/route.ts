import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use the unified storage utility
    const fileUrl = await uploadFile(file, `case-${id}`);

    const document = await prisma.document.create({
      data: {
        caseId: id,
        name: file.name,
        type: type || "General",
        url: fileUrl,
        uploadedBy: uploadedBy || "System",
      },
    });

    // Log this action in CaseHistory
    await prisma.caseHistory.create({
      data: {
        caseId: id,
        status: "DOCUMENT_IN_PROGRESS", // Or fetch current
        comments: `Document uploaded: ${file.name} (${type})`,
        userId: uploadedBy, // Assuming uploadedBy is the userId
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
