import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Role, Province } from "@prisma/client";
import { requireActor, requireRoles } from "@/lib/authz";
import { hashPassword } from "@/lib/security";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActor(request);
    if (!auth.ok) return auth.response;

    const roleError = requireRoles(auth.context, [Role.ADMIN_OFFICER]);
    if (roleError) return roleError;

    const { id } = await params;
    const body = await request.json();
    const { role, province, active, password, phone, district, municipality, additionalProvinces } = body;

    if (additionalProvinces !== undefined) {
      const extraProvinces: Province[] = (additionalProvinces || []).filter(
        (p: Province) => p && p !== province
      );
      await prisma.userProvinceAssignment.deleteMany({ where: { userId: id } });
      if (extraProvinces.length > 0) {
        await prisma.userProvinceAssignment.createMany({
          data: extraProvinces.map((p: Province) => ({ userId: id, province: p })),
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role: role as Role }),
        ...(province !== undefined && { province: province as Province | null }),
        ...(phone !== undefined && { phone }),
        ...(district !== undefined && { district }),
        ...(municipality !== undefined && { municipality }),
        ...(active !== undefined && { active }),
        ...(password !== undefined && {
          password: password.startsWith("$2") ? password : await hashPassword(password),
        }),
      },
      include: { provinceAssignments: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
