import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // In a real app, you would upload the file to S3/Cloud Storage here.
    // For this demo, we'll simulate a storage URL.
    const mockUrl = `https://cloud-storage.itguysa.co.za/documents/${Date.now()}-${file.name}`;

    const document = await prisma.document.create({
      data: {
        caseId: id,
        name: file.name,
        type: type, // Data Form, Draft, Final Review, etc.
        url: mockUrl,
        uploadedBy: uploadedBy || "Unknown User",
      },
    });

    // Also update case status to "DATA_SUBMITTED" if it's a data form
    if (type === "Data Form") {
      await prisma.case.update({
        where: { id },
        data: { 
          status: "DATA_SUBMITTED",
          history: {
            create: {
              status: "DATA_SUBMITTED",
              comments: "Data collection forms uploaded by DCO.",
            }
          }
        }
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
