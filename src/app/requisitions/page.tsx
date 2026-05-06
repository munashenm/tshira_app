import { prisma } from "@/lib/db";
import { 
  CalendarDays, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Clock
} from "lucide-react";
import { RequisitionStatus } from "@prisma/client";
import CreateRequisitionModal from "@/components/CreateRequisitionModal";
import RequisitionActions from "@/components/RequisitionActions";

export default async function RequisitionsPage() {
  const requisitions = await prisma.requisition.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Space Requisitions</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage co-working space bookings for data collection teams.</p>
        </div>
        <CreateRequisitionModal />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Location / Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Purpose</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Requested By</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
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
                      {new Date(req.dateTime).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 max-w-xs">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">{req.purpose}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {req.user.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{req.user.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-8 py-6 text-right">
                  <RequisitionActions id={req.id} status={req.status} />
                </td>
              </tr>
            ))}
            {requisitions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
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
