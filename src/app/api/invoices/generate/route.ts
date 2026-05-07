import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/invoices/generate — atomically increments sequence and returns next invoice number
export async function POST() {
  try {
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
