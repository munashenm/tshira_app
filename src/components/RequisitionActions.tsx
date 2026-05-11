"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { RequisitionStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";
import { getClientActor } from "@/lib/client-auth";

export default function RequisitionActions({ 
  id, 
  status 
}: { 
  id: string; 
  status: RequisitionStatus;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const handleAction = async (newStatus: RequisitionStatus) => {
    setIsSubmitting(true);
    try {
      const actor = getClientActor();
      const res = await fetch(`/api/requisitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          approvedById: actor?.id,
          userId: actor?.id
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = currentPersona?.role === Role.ADMIN_OFFICER;
  const isFinance = currentPersona?.role === Role.FINANCE;

  const canAdminApprove = isAdmin && status === "SUBMITTED";
  const canFinanceApprove = isFinance && (status === "SUBMITTED" || status === "APPROVED");

  if (canAdminApprove || canFinanceApprove) {
    return (
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => handleAction(isFinance ? RequisitionStatus.BOOKED : RequisitionStatus.APPROVED)}
          disabled={isSubmitting}
          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50" 
          title="Approve"
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
    );
  }

  return (
    <div className="flex justify-end">
      <button className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}
