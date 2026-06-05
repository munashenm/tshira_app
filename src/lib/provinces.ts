import { Province, Role } from "@prisma/client";

export interface ProvinceScopeUser {
  role: Role;
  province: Province | null;
  provinceAssignments?: { province: Province }[];
}

export function getUserProvinces(user: ProvinceScopeUser): Province[] {
  const provinces = new Set<Province>();
  if (user.province) provinces.add(user.province);
  user.provinceAssignments?.forEach((assignment) => provinces.add(assignment.province));
  return Array.from(provinces);
}

export function canAccessProvince(user: ProvinceScopeUser, province: Province): boolean {
  if (user.role === Role.ADMIN_OFFICER || user.role === Role.FINANCE || user.role === Role.NYDA) {
    return true;
  }
  return getUserProvinces(user).includes(province);
}

export function provinceWhereClause(user: ProvinceScopeUser): { province?: Province | { in: Province[] } } {
  if (user.role === Role.ADMIN_OFFICER || user.role === Role.FINANCE || user.role === Role.NYDA) {
    return {};
  }
  const provinces = getUserProvinces(user);
  if (provinces.length === 0) return { province: "LIMPOPO" as Province }; // no access fallback
  if (provinces.length === 1) return { province: provinces[0] };
  return { province: { in: provinces } };
}
