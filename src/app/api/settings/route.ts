import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET settings — creates singleton with defaults if not exists
export async function GET() {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton" },
      update: {},
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PATCH settings — partial update
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const settings = await prisma.systemSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...body },
      update: body,
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
