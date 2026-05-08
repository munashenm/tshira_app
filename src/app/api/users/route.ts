import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";

export async function GET(request: Request) {
  const auth = await requireActor(request);
  if (!auth.ok) return auth.response;

  const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER, Role.PROVINCIAL_COORDINATOR]);
  if (roleError) return roleError;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role;

  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER]);
    if (roleError) return roleError;

    const body = await request.json();
    const { name, email, password, role, province } = body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
        province,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user. Email might already exist." }, { status: 500 });
  }
}
