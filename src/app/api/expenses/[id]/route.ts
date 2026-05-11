import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER]);
    if (roleError) return roleError;

    const { id } = await params;
    const { status } = body;

    const expense = await prisma.expense.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}
