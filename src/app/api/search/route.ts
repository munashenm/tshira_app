import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const [cases, clients] = await Promise.all([
    prisma.case.findMany({
      where: {
        OR: [
          { clientName: { contains: q, mode: "insensitive" } },
          { nydaReference: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      select: { id: true, clientName: true, nydaReference: true, status: true, province: true, outputType: true },
    }),
    prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { idNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, idNumber: true, province: true },
    }),
  ]);

  return NextResponse.json({
    cases,
    clients,
  });
}
