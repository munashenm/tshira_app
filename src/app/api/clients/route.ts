import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, idNumber, phone, address, province, email } = body;

    if (!name || !idNumber || !province) {
      return NextResponse.json({ error: "Name, ID Number and Province are required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name,
        idNumber,
        phone,
        address,
        province: province as Province,
        email,
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Error creating client:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "A client with this ID number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
