import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, Role } from "@prisma/client";
import { requireActor } from "@/lib/authz";
import { provinceWhereClause, canAccessProvince } from "@/lib/provinces";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const actorWithProvinces = await prisma.user.findUnique({
      where: { id: auth.context.actor.id },
      select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
    });
    const provinceFilter = actorWithProvinces ? provinceWhereClause(actorWithProvinces) : {};

    const expenses = await prisma.expense.findMany({
      where: provinceFilter,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        coordinator: { select: { name: true } },
        dco: { select: { name: true } },
        case: { select: { clientName: true, nydaReference: true } },
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const amount = parseFloat(formData.get("amount") as string);
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const caseId = (formData.get("caseId") as string) || null;
    const province = formData.get("province") as Province;
    const coordinatorId = (formData.get("coordinatorId") as string) || null;
    const dcoId = (formData.get("dcoId") as string) || null;
    const paymentMethod = (formData.get("paymentMethod") as string) || null;
    const receipt = formData.get("receipt") as File | null;

    if (!amount || !category || !description || !province || !paymentMethod) {
      return NextResponse.json({ error: "Missing required expense fields." }, { status: 400 });
    }

    if (!receipt || !receipt.size) {
      return NextResponse.json({ error: "Receipt / proof of payment is required." }, { status: 400 });
    }

    const actorWithProvinces = await prisma.user.findUnique({
      where: { id: auth.context.actor.id },
      select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
    });
    if (actorWithProvinces && !canAccessProvince(actorWithProvinces, province)) {
      return NextResponse.json({ error: "Forbidden: expense province not in your assignment." }, { status: 403 });
    }

    if (dcoId) {
      const dco = await prisma.user.findFirst({
        where: {
          id: dcoId,
          role: Role.DATA_COLLECTION_OFFICER,
          active: true,
          OR: [
            { province },
            { provinceAssignments: { some: { province } } },
          ],
        },
      });
      if (!dco) {
        return NextResponse.json({ error: "Selected DCO is not assigned to this province." }, { status: 400 });
      }
    }

    const receiptUrl = await uploadFile(receipt, "expense-receipts");

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        description,
        caseId,
        userId: auth.context.actor.id,
        province,
        coordinatorId,
        dcoId,
        paymentMethod,
        receiptUrl,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
