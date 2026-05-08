import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

// POST /api/invoices/generate — atomically increments sequence and returns next invoice number
export async function POST(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.FINANCE, Role.ADMIN_OFFICER]);
    if (roleError) return roleError;

    const settings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: { invoiceSequence: { increment: 1 } },
    });

    const year = new Date().getFullYear();
    const seq = String(settings.invoiceSequence).padStart(4, "0");
    const invoiceNumber = `${settings.invoicePrefix}-${year}-${seq}`;

    return NextResponse.json({ invoiceNumber, sequence: settings.invoiceSequence });
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return NextResponse.json({ error: "Failed to generate invoice number" }, { status: 500 });
  }
}
