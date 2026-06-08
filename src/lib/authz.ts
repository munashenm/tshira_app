import { CaseStatus, Role, type User } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionActorFromCookies } from "@/lib/session";

export interface AuthContext {
  actor: Pick<User, "id" | "role" | "province" | "active">;
}

const ROLE_ASSIGNMENT_RULES: Partial<Record<Role, Array<"coordinatorId" | "dcoId" | "consultantId" | "reviewerId">>> = {
  ADMIN_OFFICER: ["coordinatorId", "dcoId", "consultantId", "reviewerId"],
  PROVINCIAL_COORDINATOR: ["dcoId"],
};

const TRANSITION_RULES: Partial<Record<CaseStatus, CaseStatus[]>> = {
  RECEIVED_FROM_NYDA: ["ASSIGNED_TO_PROVINCE"],
  ASSIGNED_TO_PROVINCE: ["ASSIGNED_FOR_DATA_COLLECTION"],
  ASSIGNED_FOR_DATA_COLLECTION: ["DATA_COLLECTION_IN_PROGRESS"],
  DATA_COLLECTION_IN_PROGRESS: ["DATA_SUBMITTED"],
  DATA_SUBMITTED: ["PROVINCIAL_QUALITY_CHECK", "SUBMITTED_TO_HEAD_OFFICE", "RETURNED_FOR_DATA_CORRECTION"],
  PROVINCIAL_QUALITY_CHECK: ["RETURNED_FOR_DATA_CORRECTION", "SUBMITTED_TO_HEAD_OFFICE"],
  RETURNED_FOR_DATA_CORRECTION: ["DATA_COLLECTION_IN_PROGRESS"],
  SUBMITTED_TO_HEAD_OFFICE: ["ASSIGNED_TO_CONSULTANT", "RETURNED_FOR_DATA_CORRECTION"],
  ASSIGNED_TO_CONSULTANT: ["DOCUMENT_IN_PROGRESS", "RETURNED_FOR_DATA_CORRECTION"],
  DOCUMENT_IN_PROGRESS: ["SUBMITTED_FOR_REVIEW"],
  SUBMITTED_FOR_REVIEW: ["RETURNED_TO_CONSULTANT", "INTERNALLY_REVIEWED"],
  RETURNED_TO_CONSULTANT: ["DOCUMENT_IN_PROGRESS"],
  INTERNALLY_REVIEWED: ["SENT_TO_NYDA"],
  SENT_TO_NYDA: ["CLIENT_APPROVED"],
  CLIENT_APPROVED: ["READY_FOR_INVOICING"],
  READY_FOR_INVOICING: ["INVOICED"],
  INVOICED: ["PAID"],
  PAID: ["CLOSED"],
};

const STATUS_ROLE_RULES: Partial<Record<CaseStatus, Role[]>> = {
  ASSIGNED_TO_PROVINCE: [Role.ADMIN_OFFICER],
  ASSIGNED_FOR_DATA_COLLECTION: [Role.PROVINCIAL_COORDINATOR],
  DATA_COLLECTION_IN_PROGRESS: [Role.DATA_COLLECTION_OFFICER],
  DATA_SUBMITTED: [Role.DATA_COLLECTION_OFFICER],
  PROVINCIAL_QUALITY_CHECK: [Role.PROVINCIAL_COORDINATOR, Role.REVIEWER],
  RETURNED_FOR_DATA_CORRECTION: [Role.PROVINCIAL_COORDINATOR, Role.REVIEWER, Role.BUSINESS_CONSULTANT],
  SUBMITTED_TO_HEAD_OFFICE: [Role.PROVINCIAL_COORDINATOR],
  ASSIGNED_TO_CONSULTANT: [Role.ADMIN_OFFICER],
  DOCUMENT_IN_PROGRESS: [Role.BUSINESS_CONSULTANT],
  SUBMITTED_FOR_REVIEW: [Role.BUSINESS_CONSULTANT],
  RETURNED_TO_CONSULTANT: [Role.REVIEWER],
  INTERNALLY_REVIEWED: [Role.REVIEWER],
  SENT_TO_NYDA: [Role.ADMIN_OFFICER],
  CLIENT_APPROVED: [Role.NYDA, Role.ADMIN_OFFICER],
  READY_FOR_INVOICING: [Role.ADMIN_OFFICER],
  INVOICED: [Role.FINANCE],
  PAID: [Role.FINANCE],
  CLOSED: [Role.FINANCE, Role.ADMIN_OFFICER],
};

export async function requireActor(
  _request: Request
): Promise<{ ok: true; context: AuthContext } | { ok: false; response: NextResponse }> {
  const sessionActor = await getSessionActorFromCookies();
  if (!sessionActor) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized: missing session." }, { status: 401 }),
    };
  }

  const actor = await prisma.user.findUnique({
    where: { id: sessionActor.id },
    select: { id: true, role: true, province: true, active: true },
  });

  if (!actor || !actor.active) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized: invalid or inactive actor." }, { status: 403 }),
    };
  }

  return { ok: true, context: { actor } };
}

export function requireRoles(context: AuthContext, allowed: Role[]): NextResponse | null {
  if (!allowed.includes(context.actor.role)) {
    return NextResponse.json(
      { error: `Forbidden: role ${context.actor.role} cannot perform this action.` },
      { status: 403 }
    );
  }
  return null;
}

export function validateAssignmentPermission(
  context: AuthContext,
  fields: Array<"coordinatorId" | "dcoId" | "consultantId" | "reviewerId">
): NextResponse | null {
  const allowed = ROLE_ASSIGNMENT_RULES[context.actor.role] ?? [];
  const blockedField = fields.find((field) => !allowed.includes(field));
  if (blockedField) {
    return NextResponse.json(
      { error: `Forbidden: role ${context.actor.role} cannot assign ${blockedField}.` },
      { status: 403 }
    );
  }
  return null;
}

export function validateStatusTransition(
  context: AuthContext,
  currentStatus: CaseStatus,
  nextStatus: CaseStatus
): NextResponse | null {
  if (currentStatus === nextStatus) return null;

  const allowedNext = TRANSITION_RULES[currentStatus] ?? [];
  if (!allowedNext.includes(nextStatus) && context.actor.role !== Role.ADMIN_OFFICER) {
    return NextResponse.json(
      { error: `Invalid status transition: ${currentStatus} -> ${nextStatus}.` },
      { status: 400 }
    );
  }

  const roles = STATUS_ROLE_RULES[nextStatus];
  if (roles && !roles.includes(context.actor.role) && context.actor.role !== Role.ADMIN_OFFICER) {
    return NextResponse.json(
      { error: `Forbidden: role ${context.actor.role} cannot set status ${nextStatus}.` },
      { status: 403 }
    );
  }

  return null;
}
