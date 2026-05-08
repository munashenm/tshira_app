import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, CaseStatus, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.PROVINCIAL_COORDINATOR]);
    if (roleError) return roleError;

    const { cases } = body; // Array of case objects

    if (!Array.isArray(cases)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const createdCases = await Promise.all(
      cases.map(async (c) => {
        return prisma.case.create({
          data: {
            clientName: c.clientName,
            nydaReference: c.nydaReference,
            province: (c.province as Province) || Province.LIMPOPO,
            outputType: c.outputType || "Business Plan",
            status: CaseStatus.RECEIVED_FROM_NYDA,
            history: {
              create: {
                status: CaseStatus.RECEIVED_FROM_NYDA,
                comments: "Case imported via bulk upload",
              }
            }
          }
        });
      })
    );

    return NextResponse.json({ 
      message: `Successfully imported ${createdCases.length} cases`,
      count: createdCases.length 
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import cases" }, { status: 500 });
  }
}
