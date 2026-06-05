"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { RequisitionStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

export default function RequisitionActions({ id, status }: { id: string; status: RequisitionStatus }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const handleAction = async (newStatus: RequisitionStatus) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requisitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentPersona?.role === Role.ADMIN_OFFICER;
  const isFinance = currentPersona?.role === Role.FINANCE;

  const canAdminApprove = isAdmin && status === RequisitionStatus.SUBMITTED;
  const canFinanceApprove = isFinance && status === RequisitionStatus.APPROVED;

  if (canAdminApprove) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleAction(RequisitionStatus.APPROVED)}
            disabled={isSubmitting}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Admin Approve"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleAction(RequisitionStatus.REJECTED)}
            disabled={isSubmitting}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Reject"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <span className="text-[9px] font-bold text-zinc-400 uppercase">Admin Approve</span>
      </div>
    );
  }

  if (canFinanceApprove) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleAction(RequisitionStatus.BOOKED)}
            disabled={isSubmitting}
            className="px-3 py-2 text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 text-[10px] font-black uppercase tracking-widest"
            title="Finance Approve & Confirm"
          >
            Finance Confirm
          </button>
          <button
            onClick={() => handleAction(RequisitionStatus.REJECTED)}
            disabled={isSubmitting}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
            title="Reject"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <span className="text-[9px] font-bold text-zinc-400 uppercase">Finance to Approve</span>
      </div>
    );
  }

  return null;
}
