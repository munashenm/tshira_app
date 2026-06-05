import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { CalendarDays, Clock } from "lucide-react";
import { RequisitionStatus } from "@prisma/client";
import CreateRequisitionModal from "@/components/CreateRequisitionModal";
import RequisitionActions from "@/components/RequisitionActions";
import { getSessionActorFromCookies } from "@/lib/session";
import { provinceWhereClause } from "@/lib/provinces";

export default async function RequisitionsPage() {
  const actor = await getSessionActorFromCookies();
  let requisitions: Array<{
    id: string;
    province: string;
    location: string;
    dateTime: Date;
    meetingTime: string | null;
    meetingReference: string | null;
    purpose: string;
    status: RequisitionStatus;
    approvedById: string | null;
    financeApprovedById: string | null;
    user: { name: string | null };
    client: { name: string; companyName: string | null } | null;
    dco: { id: string; name: string | null } | null;
  }> = [];
  let clients: { id: string; name: string; companyName: string | null; province: string }[] = [];
  let dcos: { id: string; name: string | null }[] = [];

  if (actor) {
    const actorUser = await prisma.user.findUnique({
      where: { id: actor.id },
      select: { role: true, province: true, provinceAssignments: { select: { province: true } } },
    });

    const provinceFilter = actorUser ? provinceWhereClause(actorUser) : {};

    requisitions = await prisma.requisition.findMany({
      where: provinceFilter,
      orderBy: { createdAt: "desc" },
      include: { user: true, client: true, dco: { select: { id: true, name: true } } },
    });

    clients = await prisma.client.findMany({
      where: provinceFilter,
      orderBy: { name: "asc" },
      select: { id: true, name: true, companyName: true, province: true },
    });

    if (actorUser?.province || (actorUser?.provinceAssignments?.length ?? 0) > 0) {
      const provinces = [
        ...(actorUser?.province ? [actorUser.province] : []),
        ...(actorUser?.provinceAssignments?.map((a) => a.province) ?? []),
      ];
      dcos = await prisma.user.findMany({
        where: {
          role: "DATA_COLLECTION_OFFICER",
          active: true,
          OR: [
            { province: { in: provinces } },
            { provinceAssignments: { some: { province: { in: provinces } } } },
          ],
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Space Requisitions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage co-working space bookings for data collection teams.</p>
        </div>
        <CreateRequisitionModal clients={clients} dcos={dcos} actorProvince={actor?.province ?? null} />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Location / Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Purpose</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">DCO</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Coordinator</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status / Approvals</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {requisitions.map((req) => (
              <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-8 py-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    {req.province}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{req.location}</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.dateTime).toLocaleDateString("en-ZA")}
                      {req.meetingTime ? ` at ${req.meetingTime}` : ""}
                    </span>
                    {req.meetingReference && (
                      <span className="text-[10px] text-zinc-400 mt-1">Ref: {req.meetingReference}</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 max-w-xs">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{req.purpose}</span>
                </td>
                <td className="px-8 py-6">
                  {req.client ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{req.client.name}</span>
                      {req.client.companyName && <span className="text-[10px] text-zinc-500 font-medium">({req.client.companyName})</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium">-</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-zinc-600">{req.dco?.name || "-"}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                      {req.user.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{req.user.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col items-start gap-2">
                    <StatusBadge status={req.status} />
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className={req.approvedById ? "text-green-500" : "text-zinc-400"}>Admin {req.approvedById ? "✓" : "Pending"}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className={req.financeApprovedById ? "text-green-500" : "text-zinc-400"}>Finance {req.financeApprovedById ? "✓" : "Pending"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <RequisitionActions id={req.id} status={req.status} />
                </td>
              </tr>
            ))}
            {requisitions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center">
                  <CalendarDays className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No space requisitions found.</p>
                  <p className="text-xs text-zinc-400 mt-1">Provincial coordinators can create new requests.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequisitionStatus }) {
  const styles: Record<RequisitionStatus, string> = {
    DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    SUBMITTED: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    APPROVED: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    REJECTED: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    BOOKED: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    CANCELLED: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600",
    COMPLETED: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-current/10 ${styles[status]}`}>
      {status}
    </span>
  );
}
