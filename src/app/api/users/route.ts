import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Province, Role } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";
import { sendNotification, notificationTemplates } from "@/lib/notifications";
import { hashPassword } from "@/lib/security";
export async function GET(request: Request) {
  const auth = await requireActor(request);
  if (!auth.ok) return auth.response;

  const roleError = requireRoles(auth.context, [
    Role.ADMIN_OFFICER,
    Role.PROVINCIAL_COORDINATOR,
    Role.DATA_COLLECTION_OFFICER,
    Role.FINANCE,
  ]);
  if (roleError) return roleError;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as Role | null;
  const province = searchParams.get("province") as Province | null;

  try {
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (province) {
      where.OR = [
        { province },
        { provinceAssignments: { some: { province } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        province: true,
        provinceAssignments: { select: { province: true } },
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
    const { name, email, phone, password, role, province, district, municipality, additionalProvinces } = body;
    const passwordHash = password?.startsWith("$2") ? password : await hashPassword(password || "password123");

    const extraProvinces: Province[] = (additionalProvinces || []).filter(
      (p: Province) => p && p !== province
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: passwordHash,
        role,
        province: province || null,
        district,
        municipality,
        provinceAssignments: extraProvinces.length
          ? { create: extraProvinces.map((p: Province) => ({ province: p })) }
          : undefined,
      },
      include: { provinceAssignments: true },
    });

    if (email) {
      await sendNotification({
        to: email,
        name: name || "Team Member",
        type: "EMAIL",
        message: notificationTemplates.teamMemberAdded(role, password || "configured securely"),
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user. Email might already exist." }, { status: 500 });
  }
}
